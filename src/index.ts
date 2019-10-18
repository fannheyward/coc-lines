import { VimCompleteItem, workspace, CompleteResult, ExtensionContext, sources } from 'coc.nvim';

export async function activate(context: ExtensionContext): Promise<void> {
  const lineResult = <CompleteResult>{};

  context.subscriptions.push(
    workspace.onDidOpenTextDocument(async _e => {
      const doc = await workspace.document;
      const items: VimCompleteItem[] = [];
      doc.getLines(0, doc.lineCount).forEach(word => {
        items.push({ word });
      });
      lineResult.items = items;
    }),

    sources.createSource({
      name: 'lines', // unique id
      shortcut: '[Lines]', // [CS] is custom source
      priority: 1,
      triggerPatterns: [], // RegExp pattern
      doComplete: async () => {
        return lineResult;
      }
    })
  );
}

