# dpp-ext-toml

This ext implements toml loading.

## Required

### denops.vim

https://github.com/vim-denops/denops.vim

### dpp.vim

https://github.com/Shougo/dpp.vim

## Configuration

```typescript
const [context, options] = await args.contextBuilder.get(args.denops);

const tomlPlugins = await args.dpp.extAction(
  args.denops,
  context,
  options,
  "toml",
  "load",
  {
    path: "$BASE_DIR/deinlazy.toml",
    options: {
      lazy: true,
    },
  },
) as Plugin[];
```
