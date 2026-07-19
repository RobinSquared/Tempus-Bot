const { SlashCommandBuilder, ContainerBuilder, TextDisplayBuilder, MediaGalleryBuilder, MessageFlags, SeparatorBuilder, SeparatorSpacingSize } = require('discord.js')

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('userinfo')
		.setDescription('Get user information.')
        .setIntegrationTypes(0)
        .setContexts(0)
        .addUserOption((option) =>
            option.setName('user')
            .setDescription("The user you want information on (Optional)")
            .setRequired(false)),
	async execute(interaction) {
        let user = interaction.options.getUser('user') ?? interaction.user;

        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const displayName = member?.displayName ?? user.globalName ?? user.username;
        const joinedAt = member?.joinedAt
            ? `<t:${Math.floor(new Date(member.joinedAt).getTime() / 1000)}:f>`
            : 'Not in this server';
        const roleCount = member?.roles?.cache ? member.roles.cache.size - 1 : 0;
        const roles = member?.roles?.cache
            ? member.roles.cache.filter((role) => role.id !== interaction.guild.id).map((role) => role.toString()).slice(0, 8).join(' • ')
            : 'No extra roles';
        const highestRole = member?.roles?.highest?.name ?? 'None';
        const status = member?.presence?.status ?? 'offline';
        const avatarUrl = user.displayAvatarURL({ size: 1024, dynamic: true });
        const bannerUrl = user.bannerURL({ size: 1024 }) ?? member?.displayBannerURL({ size: 1024 }) ?? null;

        const lines = [
            `## 👤 ${user.username}${user.globalName ? ` • ${user.globalName}` : ''}`,
            '',
            `**Display Name:** ${displayName}`,
            `**Handle:** <@${user.id}>`,
            `**Account Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:f>`
        ];
        const details = [
            `**Joined Server:** ${joinedAt}`,
            `**Highest Role:** ${highestRole}`,
            `**Roles:** ${roleCount > 0 ? `${roleCount} role${roleCount === 1 ? '' : 's'} • ${roles}` : 'No extra roles'}`,
            `**Boosting:** ${member?.premiumSince ? 'Yes' : 'No'}`,
            `**Bot:** ${user.bot ? 'Yes' : 'No'}`,
            `**Status:** ${status}`
        ];

        const container = new ContainerBuilder();
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(lines.join('\n'))
        );
        container.addSeparatorComponents(new SeparatorBuilder({ spacing: SeparatorSpacingSize.Small, divider: true }));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(details.join('\n'))
        );

        const profileImageUrl = bannerUrl ?? avatarUrl;
        if(profileImageUrl) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder({
                    items: [{ media: { url: profileImageUrl } }]
                })
            );
        }

        await interaction.reply({
            flags: MessageFlags.IsComponentsV2,
            components: [container],
            allowedMentions: { parse: [] }
        });
	}
};