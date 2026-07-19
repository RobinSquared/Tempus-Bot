const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js')
const owospeak = require("owospeak");

module.exports = {
	data: new SlashCommandBuilder()
		.setName('owoify')
		.setDescription('UwU wats dis? You want t-to owoify a message? Oh Senpai-san-.- p-pwease u-use me.')
        .setDMPermission(false)
        .addStringOption((option) =>
            option.setName('message')
            .setDescription('What message wouwd you w-wike to o-owoify senpai-san?')
            .setRequired(true)
        ),
	async execute(interaction) {
        const message = interaction.options.getString('message');

        await interaction.deferReply({ flags: MessageFlags.IsComponentsV2 });

        let toConvert = message;
        if (/^\d+$/.test(message)) {
            const fetched = await interaction.channel.messages.fetch(message).catch(() => null);
            if (fetched) toConvert = fetched.cleanContent;
        }

        const converted = owospeak.convert(toConvert, { stutter: true, tilde: true });

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## OwOify\n\n**Original:** ${toConvert}\n\n**OwOified:** ${converted}`)
        );

        await interaction.editReply({ flags: MessageFlags.IsComponentsV2, components: [container], allowedMentions: { parse: [] } });
	}
};