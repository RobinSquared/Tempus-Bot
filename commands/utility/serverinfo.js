const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js')

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('serverinfo')
		.setDescription('Get advanced information about the guild you\'re in.')
        .setIntegrationTypes(0)
        .setContexts(0),
	async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner().catch(() => null);
        const ownerId = owner?.id ?? guild.ownerId ?? 'Unknown';
        const ownerName = owner?.user?.globalName || owner?.user?.username || 'Unknown';
        const guildName = (guild.partnered || guild.verified) ? `${guild.name} ✅` : guild.name;
        const iconUrl = guild.iconURL({ size: 1024, dynamic: true });
        const lines = [
            `## 🏠 ${guildName}`,
            '',
            `**Owner:** ${ownerId === 'Unknown' ? 'Unknown' : `<@${ownerId}>`}`,
            `**Owner ID:** ${ownerId}`,
            `**Created:** <t:${Math.floor(new Date(guild.createdAt).getTime() / 1000)}:f>`
        ];
        const details = [
            `**Partnered:** ${guild.partnered ? 'Yes' : 'No'}`,
            `**Verified:** ${guild.verified ? 'Yes' : 'No'}`,
            `**Boost Tier:** ${guild.premiumTier}`,
            `**Boosts:** ${guild.premiumSubscriptionCount}`,
            `**Members:** ${guild.memberCount}`,
            `**Roles:** ${guild.roles.cache.size}`,
            `**Channels:** ${guild.channels.cache.size}`,
            `**Emojis:** ${guild.emojis.cache.size}`,
            `**Verification Level:** ${guild.verificationLevel}`,
            `**NSFW Level:** ${guild.nsfwLevel}`
        ];

        if(guild.description != null) {
            lines.push(`**Description:** ${guild.description}`);
        }
        if(guild.rulesChannelId != null) {
            lines.push(`**Rules Channel:** <#${guild.rulesChannelId}>`);
        }
        if(guild.afkChannelId != null) {
            lines.push(`**AFK Channel:** <#${guild.afkChannelId}>`);
        }

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(lines.join('\n'))
        );
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(details.join('\n'))
        );

        if(iconUrl) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder({
                    items: [{ media: { url: iconUrl } }]
                })
            );
        }

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
            allowedMentions: { parse: [] }
        })
	}
};