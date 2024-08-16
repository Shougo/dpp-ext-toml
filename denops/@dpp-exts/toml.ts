import {
  type Action,
  type BaseActionParams,
  BaseExt,
  type MultipleHook,
  type Plugin,
} from "jsr:@shougo/dpp-vim@~2.2.0/types";

import type { Denops } from "jsr:@denops/std@~7.0.1";

import { basename } from "jsr:@std/path@~1.0.2";
import { parse } from "jsr:@std/toml@~1.0.0";

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

export type ExtActions<Params extends BaseActionParams> = {
  load: Action<Params, Toml>;
}

export class Ext extends BaseExt<Params> {
  override actions: ExtActions<Params> = {
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
        };
      },
    },
  };

  override params(): Params {
    return {};
  }
}
