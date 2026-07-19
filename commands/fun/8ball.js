const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('8ball')
		.setDescription('Ask the 8ball a question and get an answer STRAIGHT from the cosmos. (Results Vary)')
        .setDMPermission(false)
		.addStringOption((option) => 
			option.setName('question')
			.setDescription('The important question you want answered.')
			.setRequired(true)
			.setMaxLength(200)
        )
        .addBooleanOption(option =>
            option.setName('drink')
			.setDescription('Drink the blue liquid inside?')
			.setRequired(true)
        )
,
	async execute(interaction) {
        const question = interaction.options.getString('question');
        const drink = interaction.options.getBoolean('drink');

        const roll = [
            ["01", "It is decidedly so"],
            ["02", "Without a doubt"],
            ["03", "Yes definitely"],
            ["04", "As I see it, yes"],
            ["05", "You may rely on it"],
            ["06", "Most likely"],
            ["07", "Outlook good"],
            ["08", "Yes"],
            ["09", "Reply hazy, try again"],
            ["10", "Ask again later"],
            ["11", "Better not tell you now"],
            ["12", "Cannot predict now"],
            ["13", "Concentrate and ask again"],
            ["14", "Don't count on it"],
            ["15", "My reply is no"],
            ["16", "Outlook not so good"],
            ["17", "Very doubtful"],
            ["18", "My sources say no"],
            ["19", "Signs point to yes"],
            ["20", "It is certain"]
        ]

        const answer = roll[Math.floor(Math.random()* roll.length)];
        const imageUrl = drink === true
            ? `https://cdn.lockyzmedia.com/discord/bit/images/8ball/cracked/id-${answer[0]}.png`
            : `https://cdn.lockyzmedia.com/discord/bit/images/8ball/id-${answer[0]}.png`;

        const container = new ContainerBuilder();
        const lines = [
            '## 🎱 Magic 8ball',
            '',
            `**Question:** ${question}`,
            `**Answer:** ${answer[1]}`,
            '',
            '> A fate has been revealed.'
        ];

        if(drink === true) {
            const drinkChoices = [
                ["01", "died"],
                ["02", "can now see into the future"],
                ["03", "passed out"],
                ["04", "it tasted tangy"]
            ];

            const drinkAnswer = drinkChoices[Math.floor(Math.random()* drinkChoices.length)];
            lines.push('', `**Result:** ${interaction.user.username} drank the blue liquid and ${drinkAnswer[1]}`);
        }

        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(lines.join('\n'))
        );
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder({
                items: [{ media: { url: imageUrl } }]
            })
        );

        const replyOptions = {
            flags: MessageFlags.IsComponentsV2,
            components: [container]
        };

        await interaction.reply(replyOptions);
	}
};