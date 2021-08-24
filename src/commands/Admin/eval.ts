import util from "util";
import { ApplicationCommand, ShewenyClient } from "sheweny";
import type { CommandInteraction } from "discord.js";

export class EvalCommand extends ApplicationCommand {
  constructor(client: ShewenyClient) {
    super(
      client,
      {
        name: "eval",
        description: "Eval a javascript code",
        type: "CHAT_INPUT",
        options: [
          {
            name: "code",
            description: "The code to eval",
            type: "STRING",
            required: true,
          },
        ],
      },
      {
        category: "Admin",
        userPermissions: ["BOT_ADMIN"],
      }
    );
  }
  async execute(interaction: CommandInteraction) {
    let evaled = interaction.options.getString("code", true);

    try {
      evaled = await eval(evaled);
      if (typeof evaled === "object")
        evaled = util.inspect(evaled, { depth: 0, showHidden: true });
    } catch (err) {
      return interaction.reply(`\`\`\`js\n${err.stack}\`\`\``);
    }

    const token = this.client.config.token;
    const regex = new RegExp(token, "g");
    evaled = evaled.replace(regex, "sorry but you won't see the token");

    const fullLen = evaled.length;

    if (fullLen === 0) {
      return null;
    }
    if (fullLen > 2000) {
      const evaledMatch = evaled.match(/[\s\S]{1,1900}[\n\r]/g) || [];

      if (evaledMatch.length > 3) {
        interaction.channel!.send({
          content: `\`\`\`js\n${evaledMatch[0]}\`\`\``,
        });
        interaction.channel!.send({
          content: `\`\`\`js\n${evaledMatch[1]}\`\`\``,
        });
        interaction.channel!.send({
          content: `\`\`\`js\n${evaledMatch[2]}\`\`\``,
        });
        return;
      }
      return evaledMatch.forEach((message: any) => {
        interaction.reply(`\`\`\`js\n${message}\`\`\``);
        return;
      });
    }
    return interaction.reply({ content: `\`\`\`js\n${evaled}\`\`\`` });
  }
}
