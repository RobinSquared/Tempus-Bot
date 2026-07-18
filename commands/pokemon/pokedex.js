const { SlashCommandBuilder, ButtonBuilder, EmbedBuilder, Permission, MessageButton, AttachmentBuilder  } = require('discord.js');
const { createCanvas, Image, GlobalFonts, loadImage } = require('@napi-rs/canvas');
const fs = require('fs');
const { readFile } = require('fs/promises');
const { request } = require('undici');

module.exports = {

    cooldown: 5,

    data: new SlashCommandBuilder()
        .setName('pokedex')
        .setDescription('Get information on a specific pokemon')
        .setDMPermission(false)
        .addStringOption((option) => 
            option.setName('pokemon')
            .setDescription('The pokemon you want information on.')
            .setRequired(true)
        )
        .setIntegrationTypes(0,1)
        .setContexts(0,1,2),
    async execute(interaction) {
        const { default: Pokedex } = await import('pokedex-promise-v2');
        const P = new Pokedex();

        const pokemonChoice = interaction.options.getString("pokemon");
        const pokemon = pokemonChoice.toLowerCase().replaceAll(" ", "-");
        const outputPath = `./assets/generatedImages/${pokemon}.png`;

        await interaction.deferReply();

        if (!fs.existsSync('./assets/generatedImages')) {
            fs.mkdirSync('./assets/generatedImages', { recursive: true });
        }

        if (fs.existsSync(outputPath)) {
            const attachment = new AttachmentBuilder(outputPath);
            await interaction.editReply({ files: [attachment] });
            return;
        }

        function splitString(str, numWords) {
            const words = str.split(' ');
            const firstWords = words.slice(0, numWords);
            const remainingWords = words.slice(numWords).join(' ');
            return [firstWords.join(' '), remainingWords];
        }

        const canvas = createCanvas(1920, 1080);
        const context = canvas.getContext('2d');

        const loadAndDrawImage = async (imagePath, x, y, width, height) => {
            const image = await loadImage(imagePath);
            context.drawImage(image, x, y, width, height);
        };

        await Promise.all([
            loadAndDrawImage('./assets/images/descriptionBackground.png', 30, 868, 840, 182),
            loadAndDrawImage('./assets/images/titleBackground.png', 1276, 30, 612, 63),
            loadAndDrawImage('./assets/images/infoBackground.png', 1276, 93, 612, 397),
        ]);

        const separatorImage = await loadImage('./assets/images/seperater.png');
        const separatorPositions = [
            [1276, 93],
            [1276, 150],
            [1276, 200],
            [1276, 250],
            [1276, 300],
            [1276, 410],
        ];

        separatorPositions.forEach(([x, y]) => {
            context.drawImage(separatorImage, x, y, 606, 0.5);
        });

        context.letterSpacing = '5px';
        context.font = '30px sans-serif';
        context.textAlign = 'center';
        context.strokeStyle = '#ffffff';
        context.fillStyle = '#ffffff';
        context.lineWidth = 5;
        context.fillText('Egg Groups', 1375, 225);
        context.fillText('Catch Rate', 1375, 275);
        context.fillText('Height', 1375, 125);
        context.fillText('Abilities', 1375, 355);
        context.fillText('Weight', 1375, 175);

        let speciesResponse;
        let pokemonResponse;

        try {
            speciesResponse = await P.getPokemonSpeciesByName(pokemon);
            pokemonResponse = await P.getPokemonByName(pokemon);
        } catch (err) {
            if (err?.response?.status === 404) {
                return interaction.editReply({ content: 'That pokemon could not be found!' });
            }
            console.log(err);
            throw err;
        }

        const imgURL = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesResponse.pokedex_numbers[0].entry_number}.png`;
        const pokemonArtwork = await loadImage(imgURL);
        context.drawImage(pokemonArtwork, 30, 30, 747, 747);

        const englishFlavorEntry = speciesResponse.flavor_text_entries.find((entry) => entry.language?.name === 'en');
        const description = englishFlavorEntry
            ? englishFlavorEntry.flavor_text.toString().replaceAll('\u000c', ' ')
            : '';
        const descriptionSplit = splitString(description, 5);
        const descriptionOne = descriptionSplit[0];
        const descriptionTwo = splitString(descriptionSplit[1] || '', 5)[0];
        const descriptionThree = splitString(descriptionSplit[1] || '', 5)[1] || '';

        context.letterSpacing = '5px';
        context.font = '40px sans-serif';
        context.textAlign = 'center';
        context.strokeStyle = '#ffffff';
        context.fillStyle = '#ffffff';
        context.lineWidth = 5;
        context.fillText(descriptionOne, 450, 903);
        context.fillText(descriptionTwo, 450, 953);
        context.fillText(descriptionThree, 450, 1003);

        context.font = '25px sans-serif';
        context.fillText(speciesResponse.egg_groups[0]?.name || 'Unknown', 1602, 225);
        context.fillText(speciesResponse.capture_rate.toString(), 1602, 275);
        context.font = '50px sans-serif';
        context.fillText(`No ${speciesResponse.pokedex_numbers[0].entry_number} ${speciesResponse.name}`, 1577, 80);

        const firstAbility = pokemonResponse.abilities[0]?.ability?.name || 'Unknown';
        const secondAbilityEntry = pokemonResponse.abilities[1];
        const hiddenAbilityEntry = pokemonResponse.abilities.find((ability) => ability.is_hidden);

        let abilityTwo = '2: Unknown';
        let hiddenAbility = 'Hidden: Unknown';

        if (secondAbilityEntry?.is_hidden) {
            abilityTwo = `Hidden: ${secondAbilityEntry.ability.name}`;
        } else if (pokemonResponse.abilities[1]) {
            abilityTwo = `2: ${pokemonResponse.abilities[1].ability.name}`;
        }

        if (hiddenAbilityEntry) {
            hiddenAbility = `Hidden: ${hiddenAbilityEntry.ability.name}`;
        }

        context.font = '25px sans-serif';
        context.fillText(`${pokemonResponse.height / 10}m`, 1602, 125);
        context.fillText(`${pokemonResponse.weight / 10}kg`, 1602, 175);
        context.fillText(`1: ${firstAbility}`, 1602, 325);
        context.fillText(abilityTwo, 1602, 355);
        context.fillText(hiddenAbility, 1602, 385);

        context.font = '30px sans-serif';
        context.fillText(`HP: ${pokemonResponse.stats[0]?.base_stat ?? 0}`, 1377, 435);
        context.fillText(`Atk: ${pokemonResponse.stats[1]?.base_stat ?? 0}`, 1581, 435);
        context.fillText(`Def: ${pokemonResponse.stats[2]?.base_stat ?? 0}`, 1785, 435);
        context.fillText(`Speed: ${pokemonResponse.stats[5]?.base_stat ?? 0}`, 1377, 475);
        context.fillText(`SP Atk: ${pokemonResponse.stats[3]?.base_stat ?? 0}`, 1581, 475);
        context.fillText(`SP Def: ${pokemonResponse.stats[4]?.base_stat ?? 0}`, 1785, 475);

        fs.writeFileSync(outputPath, canvas.toBuffer('image/png'));
        const attachment = new AttachmentBuilder(outputPath, { name: `${pokemon}.png` });
        await interaction.editReply({ files: [attachment] });
    }
}