import type { BaseParams, Plugin } from "jsr:@shougo/dpp-vim@~4.2.0/types";
import { type Action, BaseExt } from "jsr:@shougo/dpp-vim@~4.2.0/ext";
import type { MultipleHook } from "jsr:@shougo/dpp-vim@~4.2.0/config";

import type { Denops } from "jsr:@denops/std@~7.5.0";

import { basename } from "jsr:@std/path@~1.0.2/basename";
import { parse } from "jsr:@std/toml@~1.0.0/parse";

export type Params = Record<string, never>;

export type LoadArgs = {
  path: string;
  options?: Partial<Plugin>;
};

export type Toml = {
  ftplugins?: Record<string, string>;
  hooks_file?: string;
  multiple_hooks?: MultipleHook[];
  plugins?: Plugin[];
};

export type ExtActions<Params extends BaseParams> = {
  load: Action<Params, Toml>;
};

export class Ext extends BaseExt<Params> {
  override actions: ExtActions<Params> = {
    load: {
      description: "Load toml config",
      callback: async (args: {
        denops: Denops;
        actionParams: BaseParams;
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
        };
      },
    },
  };

  override params(): Params {
    return {};
  }
}
