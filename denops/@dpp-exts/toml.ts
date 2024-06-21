import {
  Actions,
  BaseExt,
  Plugin,
} from "https://deno.land/x/dpp_vim@v0.2.0/types.ts";
import { basename, Denops } from "https://deno.land/x/dpp_vim@v0.2.0/deps.ts";
import { parse } from "jsr:@std/toml@0.224.0";

type Params = Record<string, never>;

type LoadArgs = {
  path: string;
  options?: Partial<Plugin>;
};

export type MultipleHook = {
  hook_add?: string;
  hook_post_source?: string;
  hook_source?: string;
  plugins: string[];
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
          ftplugins: toml.ftplugins,
          hooks_file: toml.hooks_file,
          multiple_hooks: toml.multiple_hooks,
          plugins,
        } satisfies Toml;
      },
    },
  };

  override params(): Params {
    return {};
  }
}
