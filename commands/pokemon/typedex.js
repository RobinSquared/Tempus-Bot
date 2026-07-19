const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const dismondb = require('dismondb');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

const TYPE_COLORS = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C', ice: '#96D9D6',
    fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dark: '#705746', dragon: '#6F35FC', steel: '#B7B7CE', fairy: '#D685AD'
};

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('typedex')
        .setDescription('Get information on a specific type (English output)')
        .setDMPermission(false)
        .addStringOption((option) =>
            option.setName('type')
            .setDescription('The type you want information on.')
            .setRequired(true)
            .setAutocomplete(true)
        ),
    async execute(interaction) {
        const type = interaction.options.getString('type').toLowerCase();
        const data = dismondb.typedex(type, 4);

        await interaction.deferReply();

        const key = `type-${type}`;
        const outputPath = `./assets/generatedImages/typedex/${key}.png`;
        if (!fs.existsSync('./assets/generatedImages/typedex')) fs.mkdirSync('./assets/generatedImages/typedex', { recursive: true });
        if (fs.existsSync(outputPath)) {
            const attachment = new AttachmentBuilder(outputPath);
            await interaction.editReply({ files: [attachment] });
            return;
        }

        const width = 1000, height = 600;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        const bg = TYPE_COLORS[type] ?? '#888888';
        // background gradient
        const g = ctx.createLinearGradient(0, 0, width, height);
        g.addColorStop(0, shadeColor(bg, -12));
        g.addColorStop(1, '#0b0b0b');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);

        // Type symbol (draw with contrasting background for legibility)
        if (data.images?.symbol) {
            const img = await loadImage(data.images.symbol).catch(() => null);
            if (img) {
                // draw circular white backing for contrast
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = 'rgba(255,255,255,0.12)';
                ctx.arc(170, 170, 110, 0, Math.PI * 2);
                ctx.fill();
                ctx.clip();
                ctx.drawImage(img, 60, 80, 220, 220);
                ctx.restore();
            }
        }

        // Title with contrasting text
        const titleColor = contrastColor(bg);
        ctx.fillStyle = titleColor;
        ctx.font = 'bold 44px sans-serif';
        ctx.fillText(`${data.name.en.toUpperCase()} TYPE`, 320, 140);

        ctx.font = '20px sans-serif';
        ctx.fillStyle = '#cccccc';
        ctx.fillText(`Generation Added: ${data.genAdded}`, 320, 180);
        ctx.fillText(`Move Count: ${data.counters.moves}`, 320, 210);
        ctx.fillText(`Pokemon Count: ${data.counters.pokemon.total}`, 320, 240);

        // Damage relations
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = titleColor;
        ctx.fillText('Damage Relations (From)', 60, 330);
        ctx.font = '18px sans-serif';
        const fromY = 360;
        const noEffectFrom = toListString(data.typemaps.gen6.defence.noEffect);
        const notVeryFrom = toListString(data.typemaps.gen6.defence.notVeryEffective);
        const superFrom = toListString(data.typemaps.gen6.defence.superEffective);

        ctx.fillStyle = '#f0f0f0';
        wrapText(ctx, `No Effect From: ${noEffectFrom}`, 60, fromY, 420, 24);
        wrapText(ctx, `Not Very Effective From: ${notVeryFrom}`, 60, fromY + 28, 420, 24);
        wrapText(ctx, `Super Effective From: ${superFrom}`, 60, fromY + 56, 420, 24);

        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = titleColor;
        ctx.fillText('Damage Relations (To)', 540, 330);
        ctx.font = '18px sans-serif';
        const toY = 360;
        const noEffectTo = toListString(data.typemaps.gen6.offence?.noEffect ?? data.typemaps.gen6.defence.noEffect);
        const notVeryTo = toListString(data.typemaps.gen6.offence?.notVeryEffective ?? data.typemaps.gen6.defence.notVeryEffective);
        const superTo = toListString(data.typemaps.gen6.offence?.superEffective ?? data.typemaps.gen6.defence.superEffective);

        ctx.fillStyle = '#f0f0f0';
        wrapText(ctx, `No Effect To: ${noEffectTo}`, 540, toY, 420, 24);
        wrapText(ctx, `Not Very Effective To: ${notVeryTo}`, 540, toY + 28, 420, 24);
        wrapText(ctx, `Super Effective To: ${superTo}`, 540, toY + 56, 420, 24);

        fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
        const attachment = new AttachmentBuilder(outputPath, { name: `${key}.png` });
        await interaction.editReply({ files: [attachment] });
    }
};

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    if (line) ctx.fillText(line, x, y);
    return y + lineHeight;
}

function toListString(v) {
    if (!v) return 'None';
    if (Array.isArray(v)) return v.join(', ');
    return v.toString();
}

function shadeColor(color, percent) {
    const f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = Math.abs(percent) / 100;
    const R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    const newR = Math.round((t - R) * p) + R;
    const newG = Math.round((t - G) * p) + G;
    const newB = Math.round((t - B) * p) + B;
    return `#${(newR<<16 | newG<<8 | newB).toString(16).padStart(6, '0')}`;
}

function contrastColor(hex) {
    // returns either black or white depending on contrast with background
    const c = hex.replace('#','');
    const r = parseInt(c.substring(0,2),16);
    const g = parseInt(c.substring(2,4),16);
    const b = parseInt(c.substring(4,6),16);
    const yiq = (r*299 + g*587 + b*114) / 1000;
    return yiq >= 128 ? '#000000' : '#ffffff';
}

// autocomplete for types
module.exports.autocomplete = async (interaction) => {
    const focused = interaction.options.getFocused().toLowerCase();
    const types = Object.keys(TYPE_COLORS);
    const options = types.filter(t => t.includes(focused)).slice(0,25).map(t => ({ name: t, value: t }));
    await interaction.respond(options);
};
