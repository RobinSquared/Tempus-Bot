const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('flip')
		.setDescription('Flip a basic coin.')
        .setDMPermission(false),
	async execute(interaction) {
        const sides = [
            "heads",
            "tails",
            "heads1",
            "tails1",
            "heads2",
            "tails2",
            "heads3",
            "tails3",
            "heads4",
            "tails4",
            "heads5",
            "tails5",
        ]

        let answer = 'Nothing';
        let coinName = "Nothing";

        const answer1 = sides[Math.floor(Math.random() * sides.length)];
        if(answer1 === "heads" || answer1 === "heads1" || answer1 === "heads2" || answer1 === "heads3" || answer1 === "heads4" || answer1 === "heads5") {
            answer = "Heads"
        } else if(answer1 === "tails" || answer1 === "tails1" || answer1 === "tails2" || answer1 === "tails3" || answer1 === "tails4" || answer1 === "tails5"){
            answer = "Tails"
        }

        if(answer1 === "heads") {
            coinName = "Australian 20 Cent Coin"
        } else if(answer1 === "tails") {
            coinName = "Australian 20 Cent Coin"
        } else if(answer1 === "heads1") {
            coinName = "Australian 1 Dollar Coin"
        } else if(answer1 === "tails1") {
            coinName = "Australian 1 Dollar Coin"
        } else if(answer1 === "heads2") {
            coinName = "Australian 10 Cent Coin"
        } else if(answer1 === "tails2") {
            coinName = "Australian 10 Cent Coin"
        } else if(answer1 === "heads3") {
            coinName = "Australian 5 Cent Coin"
        } else if(answer1 === "tails3") {
            coinName = "Australian 5 Cent Coin"
        } else if(answer1 === "heads4") {
            coinName = "Australian 2 Dollar Coin"
        } else if(answer1 === "tails4") {
            coinName = "Australian 2 Dollar Coin"
        } else if(answer1 === "heads5") {
            coinName = "Australian 50 Cent Coin"
        } else if(answer1 === "tails5") {
            coinName = "Australian 50 Cent Coin"
        }

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## 🪙 Coin Flip\n\n**Result:** ${answer}\n**Coin:** ${coinName}\n\n> A tiny bit of fate has been revealed.`)
        );
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder({
                items: [{ media: { url: `https://cdn.lockyzmedia.com/discord/bit/images/flip/${answer1}.jpg` } }]
            })
        );

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        })
	}
};