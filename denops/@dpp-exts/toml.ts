import type { BaseParams, Plugin } from "jsr:@shougo/dpp-vim@~4.6.0/types";
import { type Action, BaseExt } from "jsr:@shougo/dpp-vim@~4.6.0/ext";
import type { MultipleHook } from "jsr:@shougo/dpp-vim@~4.6.0/config";
import { printError } from "jsr:@shougo/dpp-vim@~4.6.0/utils";

import type { Denops } from "jsr:@denops/std@~7.6.0";

import { basename } from "jsr:@std/path@~1.1.0/basename";
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

        try {
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
        } catch (e: unknown) {
          await printError(
            args.denops,
            e,
            `${path}: parse failed.`,
          );
        }

        return {};
      },
    },
  };

  override params(): Params {
    return {};
  }
}
