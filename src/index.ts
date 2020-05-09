import {
  BasicList,
  CompleteOption,
  CompleteResult,
  ExtensionContext,
  ListContext,
  ListItem,
  listManager,
  LocationWithLine,
  Neovim,
  sources,
  VimCompleteItem,
  workspace,
} from 'coc.nvim';
import { Position } from 'vscode-languageserver-protocol';

function pad(n: string, total: number): string {
  let l = total - n.length;
  if (l <= 0) return '';
  return new Array(l).fill(' ').join('');
}

class LineList extends BasicList {
  public readonly name = 'fuzzy_lines';
  public readonly description = 'fuzzy match lines of current buffer';
  public readonly detail = `Fuzzy match lines of current buffer.`;
  public readonly defaultAction = 'jump';

  constructor(nvim: Neovim) {
    super(nvim);

    this.addAction('jump', async (item) => {
      const location = item.location as LocationWithLine;
      await workspace.moveTo(Position.create(parseInt(location.line), 0));
    });
  }

  public async loadItems(context: ListContext): Promise<ListItem[]> {
    let { window } = context;
    let valid = await window.valid;
    if (!valid) return [];
    let buf = await window.buffer;
    let doc = workspace.getDocument(buf.id);
    if (!doc) return [];
    let lines = await buf.lines;

    let result: ListItem[] = [];
    let total = lines.length.toString().length;
    let lnum = 0;
    for (let line of lines) {
      lnum = lnum + 1;
      let pre = `${lnum}${pad(lnum.toString(), total)}`;
      const location: LocationWithLine = { uri: doc.uri, line: (lnum - 1).toString() };
      result.push({
        label: `${pre} ${line}`,
        location,
      });
    }
    return result;
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  const config = workspace.getConfiguration('coc.source.lines');
  const shortcut = config.get('shortcut') as string;
  context.subscriptions.push(
    listManager.registerList(new LineList(workspace.nvim)),

    sources.createSource({
      name: 'lines',
      doComplete: async (opt: CompleteOption) => {
        const startOfLineOnly = config.get('startOfLineOnly') as boolean;
        if (startOfLineOnly && opt.col > 0) {
          return;
        }

        const doc = await workspace.document;
        if (!doc || opt.bufnr != doc.bufnr) {
          return;
        }

        const items: VimCompleteItem[] = [];
        const lines = await doc.buffer.lines;
        for (const line of lines) {
          if (!line || line.length === 0) {
            continue;
          }

          items.push({ word: line.trim(), menu: `[${shortcut}]` });
        }

        return new Promise<CompleteResult>((resolve) => {
          resolve({ items });
        });
      },
    })
  );
}
