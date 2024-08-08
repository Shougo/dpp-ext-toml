import {
  type Actions,
  BaseExt,
  type Denops,
  type MultipleHook,
  type Plugin,
} from "jsr:@shougo/dpp-vim@~1.1.0/types";

import { basename } from "jsr:@std/path@~1.0.2";
import { parse } from "jsr:@std/toml@~1.0.0";

type Params = Record<string, never>;

type LoadArgs = {
  path: string;
  options?: Partial<Plugin>;
};

type Toml = {
  ftplugins?: Record<string, string>;
  hooks_file?: string;
  multiple_hooks?: MultipleHook[];
  plugins?: Plugin[];
};

export class Ext extends BaseExt<Params> {
  override actions: Actions<Params> = {
    load: {
      description: "Load toml config",
      callback: async (args: {
        denops: Denops;
        actionParams: unknown;
      }) => {
        const params = args.actionParams as LoadArgs;
        const path = await args.denops.call(
          "dpp#util#_expand",
          params.path,
        ) as string;

        const defaultOptions = params.options ?? {};

        const toml = parse(await Deno.readTextFile(path)) as Toml;

        const plugins = (toml.plugins ?? []).map((plugin: Plugin) => {
          return {
            ...defaultOptions,
            ...plugin,
            name: plugin.name ?? basename(plugin.repo ?? ""),
          };
        });

        return {
          ...toml,
          plugins,
        } satisfies Toml;
      },
    },
  };

  override params(): Params {
    return {};
  }
}
