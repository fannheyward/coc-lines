import { CompleteOption, CompleteResult, ExtensionContext, sources, VimCompleteItem, workspace } from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
  const shortcut = workspace.getConfiguration('coc.source.lines').get('shortcut', '');
  context.subscriptions.push(
    sources.createSource({
      name: 'lines',
      doComplete: async (opt: CompleteOption) => {
        const doc = await workspace.document;
        if (!doc || (opt && doc && opt.bufnr != doc.bufnr)) {
          return null;
        }

        const items: VimCompleteItem[] = [];
        const lines = await doc.buffer.lines;
        for (const line of lines) {
          if (!line || line.length === 0) {
            continue;
          }

          items.push({ word: line, menu: `[${shortcut}]` });
        }

        return new Promise<CompleteResult>(resolve => {
          resolve({ items });
        });
      }
    })
  );
}
