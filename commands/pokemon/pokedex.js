const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');

let _pokemonListCache = null;

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Get information on a specific Pokémon (English output)')
        .setDMPermission(false)
        .addStringOption((option) => 
            option.setName('pokemon')
            .setDescription('The pokemon you want information on.')
            .setRequired(true)
            .setAutocomplete(true)
        ),
    async execute(interaction) {
        const { default: Pokedex } = await import('pokedex-promise-v2');
        const P = new Pokedex();

        const pokemonChoice = interaction.options.getString('pokemon');
        const pokemon = pokemonChoice.toLowerCase().replaceAll(' ', '-');
        const outputPath = `./assets/generatedImages/pokedex/${pokemon}.png`;

        await interaction.deferReply();

        if (!fs.existsSync('./assets/generatedImages/pokedex')) fs.mkdirSync('./assets/generatedImages/pokedex', { recursive: true });
        if (fs.existsSync(outputPath)) {
            const attachment = new AttachmentBuilder(outputPath);
            await interaction.editReply({ files: [attachment] });
            return;
        }

        let species, details;
        const stages = [];
        try {
            species = await P.getPokemonSpeciesByName(pokemon);
            details = await P.getPokemonByName(pokemon);
            // fetch evolution chain
            if (species.evolution_chain?.url) {
                try {
                    const parts = species.evolution_chain.url.split('/').filter(Boolean);
                    const evoId = parts[parts.length - 1];
                    var evoChain = await P.getEvolutionChainById(evoId);
                    let current = [evoChain.chain];
                    while (current && current.length) {
                        stages.push(current);
                        const next = [];
                        for (const node of current) {
                            if (node.evolves_to && node.evolves_to.length) next.push(...node.evolves_to);
                        }
                        current = next;
                    }
                } catch (e) {
                    evoChain = null;
                }
            }
        } catch (err) {
            if (err?.response?.status === 404) return interaction.editReply({ content: 'That Pokémon could not be found!' });
            console.error(err);
            return interaction.editReply({ content: 'An error occurred.' });
        }

        // English description
        const flavor = species.flavor_text_entries.find(e => e.language?.name === 'en');
        const description = flavor ? flavor.flavor_text.replace(/\f|\n/g, ' ') : 'No description available.';
        let evoBottomY = 140;

        // Artwork
        const entry = species.pokedex_numbers?.[0]?.entry_number ?? species.id ?? '';
        const artUrl = entry ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${entry}.png` : null;

        const width = 1400, height = 900;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // subtle gradient background for readability
        const bg = ctx.createLinearGradient(0, 0, width, height);
        bg.addColorStop(0, '#0f1720');
        bg.addColorStop(1, '#050507');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, width, height);

        // Draw artwork large on the left
        if (artUrl) {
            const art = await loadImage(artUrl).catch(() => null);
            if (art) {
                const artSize = 720;
                const artX = 40;
                const artY = Math.floor((height - artSize) / 2) - 30;
                // draw subtle shadow behind artwork for pop
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.45)';
                roundRect(ctx, artX + 18, artY + 18, artSize, artSize, 40);
                ctx.fill();
                ctx.restore();
                ctx.drawImage(art, artX, artY, artSize, artSize);
            }
        }

        // Right panel box
        const panelX = 800, panelW = 560, pad = 28;
        ctx.fillStyle = '#151515';
        roundRect(ctx, panelX, 60, panelW, height - 120, 12);
        ctx.fill();

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(`#${entry} ${species.name.toUpperCase()}`, panelX + pad, 120);

            const thumbSize = 64;
            const gap = 18;
            const stageYStart = 150;
            const panelInnerWidth = panelW - pad * 2;

            // figure out the widest stage to decide scaling so the tree fits
            let maxStageWidth = 0;
            for (const row of stages) {
                const w = row.length * thumbSize + Math.max(0, row.length - 1) * gap;
                if (w > maxStageWidth) maxStageWidth = w;
            }
            let scale = 1;
            if (maxStageWidth > panelInnerWidth) {
                scale = panelInnerWidth / maxStageWidth;
                if (scale < 0.45) scale = 0.45;
            }
            const thumb = Math.floor(thumbSize * scale);
            const gapScaled = Math.floor(gap * scale);

            // draw each stage vertically stacked with scaled sizes
            const stageCenters = [];
            for (let s = 0; s < stages.length; s++) {
                const row = stages[s];
                const totalW = row.length * thumb + Math.max(0, row.length - 1) * gapScaled;
                let tx = panelX + pad + Math.max(0, Math.floor((panelInnerWidth - totalW) / 2));
                const ty = stageYStart + s * (thumb + 36);

                const centers = [];
                for (let i = 0; i < row.length; i++) {
                    const node = row[i];
                    const name = node.species.name;
                    try {
                        const sp = await P.getPokemonSpeciesByName(name);
                        const id = sp.id;
                        const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
                        const img = await loadImage(url).catch(() => null);
                        // circular thumb with subtle border
                        ctx.save();
                        ctx.beginPath();
                        ctx.fillStyle = '#0b0b0b';
                        ctx.arc(tx + thumb / 2, ty + thumb / 2, thumb / 2 + 6, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                        if (img) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.arc(tx + thumb / 2, ty + thumb / 2, thumb / 2, 0, Math.PI * 2);
                            ctx.clip();
                            ctx.drawImage(img, tx, ty, thumb, thumb);
                            ctx.restore();
                        }
                        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                        ctx.lineWidth = 1.5;
                        ctx.strokeRect(tx - 4, ty - 4, thumb + 8, thumb + 8);
                    } catch (e) {
                        // ignore
                    }
                    ctx.fillStyle = '#cccccc';
                    ctx.font = `${Math.max(10, Math.floor(12 * scale))}px sans-serif`;
                    ctx.fillText(name.toUpperCase(), tx, ty + thumb + 14 + Math.max(0, Math.floor(6 * (scale - 1))));
                    centers.push({ name, x: tx + thumb / 2, y: ty + thumb / 2, node });
                    tx += thumb + gapScaled;
                }
                stageCenters.push(centers);
                evoBottomY = ty + thumb + 30;
            }

            // draw connectors and trigger icons between parent/child centers
            for (let s = 0; s < stages.length - 1; s++) {
                const parents = stageCenters[s];
                const children = stageCenters[s + 1];
                const childMap = new Map(children.map(c => [c.name, c]));

                for (const p of parents) {
                    const pNode = p.node;
                    if (!pNode || !pNode.evolves_to) continue;
                    for (const childNode of pNode.evolves_to) {
                        const childName = childNode.species.name;
                        const c = childMap.get(childName);
                        if (!c) continue;
                        const startX = p.x;
                        const startY = p.y + thumb / 2 + 6;
                        const endX = c.x;
                        const endY = c.y - thumb / 2 - 6;
                        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(startX, startY);
                        const midY = (startY + endY) / 2;
                        ctx.lineTo(startX, midY);
                        ctx.lineTo(endX, midY);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();

                        // trigger icons
                        const det = (childNode.evolution_details && childNode.evolution_details[0]) || null;
                        const icons = [];
                        if (det) {
                            if (det.item && det.item.name) {
                                const itemUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${det.item.name}.png`;
                                const img = await loadImage(itemUrl).catch(() => null);
                                if (img) icons.push({ type: 'image', img });
                                else icons.push({ type: 'text', text: titleCase(det.item.name.replaceAll('-', ' ')) });
                            }
                            if (det.trigger && det.trigger.name === 'trade') icons.push({ type: 'text', text: '🔁' });
                            if (det.min_level) icons.push({ type: 'text', text: `⬆️ ${det.min_level}` });
                            if (det.min_happiness) icons.push({ type: 'text', text: '😊' });
                            if (det.needs_overworld_rain) icons.push({ type: 'text', text: '🌧️' });
                            if (det.known_move) icons.push({ type: 'text', text: '🧠' });
                        }

                        // render icons centered between startX and endX
                        if (icons.length) {
                            const centerX = (startX + endX) / 2;
                            const iconSize = Math.max(12, Math.floor(18 * scale));
                            let iconsWidth = icons.length * iconSize + Math.max(0, icons.length - 1) * 6;
                            let startIconsX = centerX - iconsWidth / 2;
                            const iconY = midY - iconSize / 2;
                            for (const ic of icons) {
                                if (ic.type === 'image') {
                                    ctx.drawImage(ic.img, startIconsX, iconY, iconSize, iconSize);
                                } else {
                                    ctx.fillStyle = 'rgba(240,240,240,0.95)';
                                    ctx.font = `${Math.max(10, Math.floor(12 * scale))}px sans-serif`;
                                    ctx.textAlign = 'left';
                                    ctx.fillText(ic.text, startIconsX, iconY + iconSize - 2);
                                    ctx.textAlign = 'left';
                                }
                                startIconsX += iconSize + 6;
                            }
                        }
                    }
                }
        }

        // Description wrap (position below evolutions if present)
        ctx.font = '20px sans-serif';
        const descX = panelX + pad;
        let descY = evoBottomY > 140 ? evoBottomY + 10 : 160;
        descY = wrapText(ctx, description, descX, descY, panelW - pad * 2, 26);

        // Basic info
        ctx.font = '20px sans-serif';
        const infoX = descX;
        let infoY = descY + 10;
        const addInfo = (label, value) => {
            ctx.fillStyle = '#aaaaaa';
            ctx.fillText(`${label}:`, infoX, infoY);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${value}`, infoX + 160, infoY);
            infoY += 30;
        };

        addInfo('Height', `${details.height / 10} m`);
        addInfo('Weight', `${details.weight / 10} kg`);
        addInfo('Egg Group', species.egg_groups?.[0]?.name ?? 'Unknown');
        addInfo('Catch Rate', species.capture_rate ?? 'Unknown');
        addInfo('Abilities', details.abilities.map(a => a.ability.name).join(' / '));

        // Stats
        ctx.font = 'bold 22px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Stats', infoX, infoY + 20);
        ctx.font = '20px sans-serif';
        let statsY = infoY + 60;
        const statNames = ['HP','Atk','Def','SpA','SpD','Spe'];
        for (let i = 0; i < 6; i++) {
            ctx.fillStyle = '#cccccc';
            ctx.fillText(`${statNames[i]}:`, infoX, statsY);
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`${details.stats[i]?.base_stat ?? 0}`, infoX + 80, statsY);
            statsY += 28;
        }

        // add faint watermark of pokemon name behind panel for quick glance
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.font = 'bold 160px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(species.name.toUpperCase(), panelX + 40, height - 60);
        ctx.restore();

        if (!fs.existsSync('./assets/generatedImages')) fs.mkdirSync('./assets/generatedImages', { recursive: true });
        fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
        const attachment = new AttachmentBuilder(outputPath, { name: `${pokemon}.png` });
        await interaction.editReply({ files: [attachment] });
    }
};

    // Autocomplete handler
    module.exports.autocomplete = async (interaction) => {
        const focused = interaction.options.getFocused().toLowerCase();
        if (!_pokemonListCache === null) {
            // noop
        }
        if (!_pokemonListCache) {
            const { default: Pokedex } = await import('pokedex-promise-v2');
            const P = new Pokedex();
            try {
                const list = await P.getPokemonsList({ limit: 2000, offset: 0 });
                _pokemonListCache = list.results.map(r => r.name);
            } catch (e) {
                _pokemonListCache = [];
            }
        }
        const options = _pokemonListCache
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

function formatTrigger(det) {
    if (!det) return null;
    // use item trigger
    const parts = [];
    if (det.trigger && det.trigger.name === 'trade') {
        if (det.trade_species && det.trade_species.name) parts.push(`Trade for ${titleCase(det.trade_species.name)}`);
        else parts.push('Trade');
    }
    if (det.trigger && det.trigger.name === 'use-item' || det.item && det.item.name) {
        const name = det.item?.name ?? (det.trigger?.name === 'use-item' ? (det.item?.name ?? '') : '');
        if (name) parts.push(`Use ${titleCase(name.replaceAll('-', ' '))}`);
    }
    if (det.trigger && det.trigger.name === 'level-up') {
        if (det.min_level) parts.push(`Level ${det.min_level}`);
        if (det.time_of_day) parts.push(`At ${titleCase(det.time_of_day)}`);
        if (det.min_happiness) parts.push('High friendship');
        if (det.needs_overworld_rain) parts.push('While Raining');
        if (det.known_move) parts.push(`Knows ${titleCase(det.known_move.name)}`);
        if (det.known_move_type) parts.push(`Knows ${titleCase(det.known_move_type.name)}-type move`);
        if (det.location) parts.push(`At ${titleCase(det.location.name)}`);
    }
    if (det.min_affection) parts.push('High affection');
    if (det.party_species) parts.push(`Party: ${titleCase(det.party_species.name)}`);
    if (det.party_type) parts.push(`Party type: ${titleCase(det.party_type.name)}`);
    if (parts.length) return parts.join(' • ');
    if (det.trigger && det.trigger.name) return titleCase(det.trigger.name.replaceAll('-', ' '));
    return null;
}

function titleCase(s) {
    return s.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

function drawWrappedCentered(ctx, text, centerX, topY, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    if (line) lines.push(line.trim());
    // draw lines centered
    ctx.textAlign = 'center';
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], centerX, topY + i * lineHeight);
    }
    ctx.textAlign = 'left';
}
