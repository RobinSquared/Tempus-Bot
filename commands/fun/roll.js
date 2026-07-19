const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('roll')
		.setDescription('Roll a dice.')
        .setDMPermission(false)
        .addIntegerOption((option) =>
            option.setName('number')
            .setDescription('The amount of dice you want to roll')
            .setRequired(true)
            .setMaxValue(20)
            .setMinValue(1)
        )
        .addIntegerOption((option) => 
			option.setName('sides')
			.setDescription('The amount of sides on the dice you want to roll (Up to 1000).')
			.setRequired(false)
            .setMaxValue(1000)
            .setMinValue(3)
		),
	async execute(interaction) {
        let soods = 6;
        const sides = interaction.options.getInteger('sides')
        const count = interaction.options.getInteger('number')

        if(!sides) {
            soods = 6;
        } else {
            soods = sides;
        }

        if(count === 1) {
            const number = Math.round(Math.random() * (soods - 1) + 1).toString()
            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`## 🎲 Dice Roll\n\n**Dice:** D${soods}\n**Result:** ${number}\n\n> One roll, one outcome.`)
            );
            return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
        } else if(count >= 2) {
            const lines = [`## 🎲 Dice Roll`, ``, `**Dice:** D${soods}`, `**Results:**`];
            for(let i = 0; i < count; i++) {
                const value = Math.round(Math.random() * (soods - 1) + 1).toString();
                lines.push(`- Dice ${i + 1}: **${value}**`);
            }

            const container = new ContainerBuilder();
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(lines.join('\n'))
            );
            return interaction.reply({ flags: MessageFlags.IsComponentsV2, components: [container] });
        }
	}
};