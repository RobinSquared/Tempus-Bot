const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

let _itemListCache = null;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('itemdex')
        .setDescription('Get information on a specific item (English output)')
        .setDMPermission(false)
        .addStringOption((option) =>
            option.setName('item')
            .setDescription('The item you want information on.')
            .setRequired(true)
            .setAutocomplete(true)
        ),
    async execute(interaction) {
        const { default: Pokedex } = await import('pokedex-promise-v2');
        const P = new Pokedex();

        const itemName = interaction.options.getString('item').toLowerCase();
        const key = itemName.replaceAll(' ', '-');
        const outputPath = `./assets/generatedImages/itemdex/item-${key}.png`;

        await interaction.deferReply();
        if (!fs.existsSync('./assets/generatedImages/itemdex')) fs.mkdirSync('./assets/generatedImages/itemdex', { recursive: true });
        if (fs.existsSync(outputPath)) {
            const attachment = new AttachmentBuilder(outputPath);
            await interaction.editReply({ files: [attachment] });
            return;
        }

        try {
            const response = await P.getItemByName(key);


            const width = 1000, height = 520;
            const canvas = createCanvas(width, height);
            const ctx = canvas.getContext('2d');
            // background gradient
            const g = ctx.createLinearGradient(0, 0, width, height);
            g.addColorStop(0, '#091119');
            g.addColorStop(1, '#071018');
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, width, height);

            // Left: stylized item artwork area
            const artX = 40, artY = 60, artBox = 400;
            // panel
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            roundRect(ctx, artX - 10, artY - 10, artBox + 20, artBox + 80, 20);
            ctx.fill();

            if (response.sprites?.default) {
                const imgUrl = response.sprites.default.replace('/media/sprites/', '/sprites/items/');
                const img = await loadImage(response.sprites.default).catch(() => null);
                if (img) {
                    // draw drop shadow + circular backdrop for visibility
                    ctx.save();
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.beginPath();
                    ctx.arc(artX + artBox/2 + 10, artY + artBox/2 - 20, artBox/2 + 8, 0, Math.PI*2);
                    ctx.fill();
                    ctx.restore();

                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(artX + artBox/2 + 10, artY + artBox/2 - 20, artBox/2, 0, Math.PI*2);
                    ctx.clip();
                    ctx.imageSmoothingEnabled = true;
                    ctx.drawImage(img, artX + 20, artY + 20, artBox - 40, artBox - 40);
                    ctx.restore();
                }
            }

            // Right: info
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 34px sans-serif';
            ctx.fillText(response.name.toUpperCase(), 480, 110);

            ctx.font = '20px sans-serif';
            const lines = [];
            lines.push(`Cost: ${response.cost === 0 ? 'Not Purchasable' : response.cost}`);
            const eff = response.effect_entries?.find(e => e.language?.name === 'en')?.short_effect ?? response.effect_entries?.[0]?.short_effect ?? 'No effect text';
            lines.push(`Effect: ${eff}`);
            lines.push(`Category: ${response.category?.name?.replaceAll('-', ' ') ?? 'Unknown'}`);
            const flavor = response.flavor_text_entries?.find(e => e.language?.name === 'en')?.text ?? '';
            const attributes = response.attributes?.map(a => a.name.replaceAll('-', ' ')).join(' / ');
            const heldBy = response.held_by_pokemon?.length ?? 0;

            let y = 160;
            for (const l of lines) {
                ctx.fillStyle = '#cccccc';
                ctx.fillText(l, 480, y);
                y += 36;
            }
            if (attributes) {
                ctx.fillStyle = '#cccccc';
                ctx.fillText(`Attributes: ${attributes}`, 480, y);
                y += 36;
            }
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`Held By Pokémon: ${heldBy}`, 480, y);
            y += 36;

            if (flavor) {
                y += 6;
                ctx.fillStyle = '#ffffff';
                ctx.font = '18px sans-serif';
                wrapText(ctx, flavor.replace(/\f|\n/g, ' '), 480, y, 460, 24);
            }

            fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
            const attachment = new AttachmentBuilder(outputPath, { name: `item-${key}.png` });
            await interaction.editReply({ files: [attachment] });
        } catch (err) {
            if (err?.response?.status === 404) return interaction.editReply({ content: 'Item not found!' });
            console.error(err);
            return interaction.editReply({ content: 'An error occurred.' });
        }
    }
};

// autocomplete
module.exports.autocomplete = async (interaction) => {
    const focused = interaction.options.getFocused().toLowerCase();
    if (!_itemListCache) {
        const { default: Pokedex } = await import('pokedex-promise-v2');
        const P = new Pokedex();
        try {
            const list = await P.getItemsList({ limit: 2000, offset: 0 });
            _itemListCache = list.results.map(r => r.name);
        } catch (e) {
            _itemListCache = [];
        }
    }
    const options = _itemListCache
        .filter(n => n.includes(focused))
        .slice(0, 25)
        .map(n => ({ name: n, value: n }));
    await interaction.respond(options);
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

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}
