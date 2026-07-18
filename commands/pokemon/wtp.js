const { EmbedBuilder, Permissions, SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js');
const ms = require("ms");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wtp')
		.setDescription('WHO\'S THAT POKEMON?')
        .setDMPermission(false)
        .addIntegerOption((option) =>
            option.setName('gen-start')
            .setDescription('Generation Start')
            .setRequired(false)
            .setMaxValue(9)
            .setMinValue(1)
        )

        .addIntegerOption((option) =>
            option.setName('gen-end')
            .setDescription('Generation End')
            .setRequired(false)
            .setMaxValue(9)
            .setMinValue(1)
        )

        .addStringOption((option) =>
            option.setName('difficulty')
            .setDescription("What difficulty would you like?")
            .setRequired(false)
            .addChoices(
                { name: "Easy", value: "easy" },
                { name: "Normal", value: "normal" },
                { name: "Hard", value: "hard" },
                { name: "Help", value: "help" },
            )
        )

        .addIntegerOption((option) =>
            option.setName('timer')
            .setDescription("How long would you like the timer to go for?")
            .setRequired(false)
            .addChoices(
                { name: '10 Seconds', value: 10000 },
                { name: '20 Seconds', value: 20000 },
                { name: '30 Seconds', value: 30000 },
                { name: '40 Seconds', value: 40000 },
                { name: '50 Seconds', value: 50000 },
                { name: '1 Minute', value: 60000 },
                { name: '1 Minute 30 Seconds', value: 90000 },
                { name: '2 Minutes', value: 120000 },
                { name: '2 Minutes 30 seconds', value: 150000 },
                { name: '3 Minutes', value: 180000 },
            )
        ),
	async execute(interaction) {
        const { default: Pokedex } = await import('pokedex-promise-v2');
        const P = new Pokedex();

        function ranNum( min, max ) {
            if(Number.isInteger(min) === false) {
                return "minNotInt";
            } else if(Number.isInteger(max === false)) {
                return "maxNotInt";
            } else {
                var result = Math.floor(Math.random() * max) + min;
                return result;
            }
        }

        const difficulty = interaction.options.getString('difficulty');

        if(difficulty === "help") {
            const embed = new EmbedBuilder()
                embed.setDescription("# Difficulty Help\n## Easy\nWill show just the picture of the pokemon to guess, the form will not be required.\n\n## Normal\nThe default option, will show the picture of the pokemon to guess, the form however will be required in the guess.\n\n## Hard\nWill show the pokemons pokedex description. The form will not be required.")

            interaction.reply({ embeds: [embed] })
            return;
        }

        await interaction.deferReply({
            flags: MessageFlags.IsComponentsV2
        });
        console.log("Reply Deferred")
        const client = interaction.client
        const genStart = interaction.options.getInteger('gen-start');
        const genEnd = interaction.options.getInteger('gen-end');
        const timerInt = interaction.options.getInteger('timer');
        

        var pokeCountStart = 1;
        var pokeCountEnd = 1025;
        var timer = 30000;
        var forms = false;
        var pot = 5;
        var isLegend = false;
        var pookedex = "NOTHING TO SEE HERE";
        var diff = "normal"

        if(difficulty === "normal") {
            forms = true;
        } else {
            diff = difficulty;
            forms = false;
        }

        if(timerInt) {
            timer = timerInt; 
        }

        if(genStart) {
            switch (genStart) {
                case 1:
                    pokeCountStart = 1;
                break;
                case 2:
                    pokeCountStart = 152;
                break;
                case 3:
                    pokeCountStart = 252;
                break;
                case 4:
                    pokeCountStart = 387;
                break;
                case 5:
                    pokeCountStart = 494;
                break;
                case 6:
                    pokeCountStart = 650;
                break;
                case 7:
                    pokeCountStart = 722;
                break;
                case 8:
                    pokeCountStart = 810;
                break;
                case 9:
                    pokeCountStart = 906;
                break;
            }
        }

        if(genEnd) {
            switch (genStart) {
                case 1:
                    pokeCountEnd = 151;
                break;
                case 2:
                    pokeCountEnd = 251;
                break;
                case 3:
                    pokeCountEnd = 386;
                break;
                case 4:
                    pokeCountEnd = 493;
                break;
                case 5:
                    pokeCountEnd = 649;
                break;
                case 6:
                    pokeCountEnd = 721;
                break;
                case 7:
                    pokeCountEnd = 809;
                break;
                case 8:
                    pokeCountEnd = 905;
                break;
                case 9:
                    pokeCountEnd = 1025;
                break;
            }
        }
        var pokemon;
        var randPoke = ranNum(pokeCountStart, pokeCountEnd);
        var pokeNum = randPoke;
        var imgNum = pokeNum;
        var pokeName = "eevee";
        var pokeDesc = ""
        if(imgNum < 10) {
            imgNum = "00"+imgNum;
        } else if(imgNum < 100 && imgNum > 10) {
            imgNum = "0"+imgNum;
        }

        P.getPokemonSpeciesByName(pokeNum)
            .then(function(response) {
                var pokedexes = response.flavor_text_entries
                for(var i=0, iLen=pokedexes.length; i<iLen; i++) {
                    if(pokedexes[i].language.name === "en") {
                        pokeDesc = pokedexes[i].flavor_text.toString().replaceAll("\n", " ").replaceAll("\u000c", " ");
                    }
                }

                if(forms === true) {
                    var formCount = response.varieties.length;
                    var formsList = response.varieties;
                    var thisFormNumber = Math.floor(Math.random()*formCount)
                    var thisForm = formsList[thisFormNumber];
                    var mainPoke = response.name;
                    if(thisFormNumber === 0) {
                        pokeName = response.name;
                    } else {
                        pokeName = thisForm.pokemon.name;
                        var formImgNumber = thisFormNumber+1
                        imgNum = imgNum+"_f"+formImgNumber;
                    }
                } else if(diff === "hard") {
                    var pokeRegEx = response.name.toUpperCase();

                    for(var i=0, iLen=pokedexes.length; i<iLen; i++) {
                        if(pokedexes[i].language.name === "en") {
                            pookedex = pokedexes[i].flavor_text.toString().replaceAll("\n", " ").replaceAll("\u000c", " ").replaceAll(pokeRegEx, "REDACTED");
                            console.log(pokeRegEx);
                            console.log(response.name.toUpperCase());
                            console.log(pookedex);
                            return;
                        }
                    }
                }
                if(response.is_legendary === true || response.is_mythical === true) {
                    isLegend = true;
                } else {
                    isLegend = false;
                }
            })

        const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
        await delay(2000);

        P.getPokemonByName(pokeNum)
            .then(function(response) {
                pokemon = response;
                if(forms === false) {
                    pokeName = pokemon.species.name;
                }

                P.getPokemonSpeciesByName(pokeNum)
                    .then(function(response) {
                        pokemon = response;
                        if(pokemon.is_legendary === true || pokemon.is_mythical === true) {
                            isLegend = true;
                        } else {
                            isLegend = false;
                        }
                    })

                //const embed = new EmbedBuilder()
                const container = new ContainerBuilder()
                const imgURL = "https://assets.pokemon.com/assets/cms2/img/pokedex/full/"+imgNum+".png"
                    if(diff === "hard") {
                        const titleDisplay = new TextDisplayBuilder()
                        titleDisplay.setContent(
                            "# WHO'S THAT POKEMON\n!guess {pokemon} to guess\n\n"+pookedex
                        )
                        console.log("Text Display Built")
                        container.addTextDisplayComponents(titleDisplay);
                        //container.addComponents(seperator, section);

                        //embed.setDescription("# WHO'S THAT POKEMON\n!guess {pokemon} to guess\n\n"+pookedex)

                        if(isLegend === true) {
                            // container.setAccentColor(255, 215, 0)
                            console.log("Accent Colour Chosen")
                            //embed.setColor('Gold')
                        } else {
                            // container.setAccentColor(88, 101, 242)
                            //embed.setColor('DarkButNotBlack')
                        }
                    } else {
                        const titleDisplay = new TextDisplayBuilder()
                        console.log("Text Display Builder")
                        const mediaGallery = new MediaGalleryBuilder({
                            items: [
                                {
                                    media: {
                                        url: imgURL,
                                    }
                                }
                            ]
                        })
                        console.log("Media Gallery Built")

                        //embed.setTitle("Who's that Pokemon?")
                        //embed.setImage("https://assets.pokemon.com/assets/cms2/img/pokedex/full/"+imgNum+".png")
                        if(forms === true) {
                            titleDisplay.setContent(
                                "# WHO'S THAT POKEMON?\n!guess {pokemon}-{form} to guess",
                            )
                            console.log("Text Display Built")
                            //embed.setDescription("# WHO'S THAT POKEMON?\n!guess {pokemon}-{form} to guess")
                        } else {
                            titleDisplay.setContent(
                                "# WHO'S THAT POKEMON\n!guess {pokemon} to guess",
                            )
                            console.log("Text Display Built")
                            //embed.setDescription("# WHO'S THAT POKEMON\n!guess {pokemon} to guess")
                        }

                        container.addTextDisplayComponents(titleDisplay)
                        const seperator = new SeparatorBuilder({
                            spacing: SeparatorSpacingSize.Large,
                            divider: true,
                        });
                        container.addSeparatorComponents(seperator)
                        console.log("Text Display Added")
                        //container.addComponents(seperator, section);
                        container.addMediaGalleryComponents(mediaGallery)
                        console.log("Media Gallery Added")

                        if(isLegend === true) {
                            // container.setAccentColor(255, 215, 0)
                            console.log("Accent Colour Set")
                            //embed.setColor('Gold')
                        } else {
                            if(forms === true) {
                                // container.setAccentColor(0, 0, 255)
                                console.log("Accent Colour Set")
                                //embed.setColor('Blue')
                            } else {
                                // container.setAccentColor(88, 101, 242)
                                console.log("Accent Colour Set")
                                //embed.setColor('DarkButNotBlack')
                            }
                        }
                    }

                var isGame = true;
                console.log("Sending Reply Payload")
                const collectorFilter = (response) => {
                    if(response.author.bot === false) {
                        if(response.content.includes("!guess")) {
                            if(response.content.toLowerCase() === "!guess "+pokeName) {
                                return true;
                            } else {
                                response.react("❌")
                            }
                        }
                    }
                }

                interaction.editReply({
                    flags: MessageFlags.IsComponentsV2,
                    components: [ container ],
                    withResponse: true
                }).then((response) => {
                    response.channel
                        .awaitMessages({ filter: collectorFilter, time: timer, max: 1, errors: ['time']})
                        .then((collected) => {
                            isGame = false;
                            const container = new ContainerBuilder()
                            const titleDisplay = new TextDisplayBuilder()
                            const descriptionDisplay = new TextDisplayBuilder()
                            titleDisplay.setContent(
                                "# CORRECT, "+collected.first().member.displayName+"\nThe answer was "+pokeName+"\n",
                            )
                            const seperator = new SeparatorBuilder({
                                spacing: SeparatorSpacingSize.Large,
                                divider: true,
                            });
                            descriptionDisplay.setContent(
                                pokeDesc
                            )
                            const mediaGallery = new MediaGalleryBuilder({
                                items: [
                                    {
                                        media: {
                                            url: imgURL
                                        }
                                    }
                                ]
                            })

                            container.addTextDisplayComponents(titleDisplay)
                            container.addSeparatorComponents(seperator)
                            container.addTextDisplayComponents(descriptionDisplay)
                            container.addMediaGalleryComponents(mediaGallery)
                            // container.setAccentColor(0, 255, 0)
                            /*const embed = new EmbedBuilder()
                                embed.setColor('Green')
                                embed.setDescription("# CORRECT, "+messages.first().member.displayName+"\nThe answer was "+pokeName+"\n"+pokeDesc)
                                embed.setImage("https://assets.pokemon.com/assets/cms2/img/pokedex/full/"+imgNum+".png")
                            interaction.editReply({ embeds: [embed] })*/
                            interaction.editReply({
                                flags: MessageFlags.IsComponentsV2,
                                components: [ container ]
                            })

                            const container2 = new ContainerBuilder()
                            const titleDisplay2 = new TextDisplayBuilder()
                            titleDisplay2.setContent(
                                "🎉🎉 Congratulations "+collected.first().member.displayName+" you got it right! 🎉🎉\n\nThe answer was "+pokeName,
                            )
                            container2.addTextDisplayComponents(titleDisplay2)
                            container2.addSeparatorComponents(seperator)
                            container2.addMediaGalleryComponents(mediaGallery)
                            collected.first().reply({
                                flags: MessageFlags.IsComponentsV2,
                                components: [ container2 ]
                            })
                        })
                        .catch((collected) => {
                            if(isGame === false) return;
                            const container = new ContainerBuilder()
                            const titleDisplay = new TextDisplayBuilder()
                            const descriptionDisplay = new TextDisplayBuilder()
                            titleDisplay.setContent(
                                "# TIMED OUT\nThe answer was "+pokeName+"\n",
                            )

                            const mediaGallery = new MediaGalleryBuilder({
                                items: [
                                    {
                                        media: {
                                            url: imgURL
                                        }
                                    }
                                ]
                            })
                            descriptionDisplay.setContent(
                                pokeDesc
                            )

                            container.addTextDisplayComponents(titleDisplay)
                            container.addMediaGalleryComponents(mediaGallery)
                            // container.setAccentColor(255, 0, 0)

                            interaction.editReply({
                                flags: MessageFlags.IsComponentsV2,
                                components: [ container ]
                            })

                            const container2 = new ContainerBuilder()
                            const titleDisplay2 = new TextDisplayBuilder()
                            titleDisplay2.setContent(
                                "The answer was "+pokeName+" you're all wrong",
                            )
                            container2.addTextDisplayComponents(titleDisplay2)
                            container2.addTextDisplayComponents(descriptionDisplay)
                            container2.addMediaGalleryComponents(mediaGallery)
                            interaction.followUp({
                                flags: MessageFlags.IsComponentsV2,
                                components: [ container2 ]
                            })
                        })
                })
            })
    }
};