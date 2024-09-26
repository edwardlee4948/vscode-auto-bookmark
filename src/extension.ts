import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    let timeoutId: NodeJS.Timeout | undefined;

    // Track the current position of the cursor
    let lastPosition: vscode.Position | null = null;

    // Keep a set of lines that are bookmarked to avoid bookmarking them again
    const bookmarkedLines: Set<string> = new Set();

    // Get the configuration setting from the workspace configuration
    function getTimerDelay(): number {
			const config = vscode.workspace.getConfiguration('autoBookmark');
			// Use the 'autoBookmark.timerDelay' setting or fallback to 30000ms if not set
			return config.get<number>('timerDelay', 30000) || 30000;
	}


    const disposable = vscode.window.onDidChangeTextEditorSelection((event) => {
        const editor = event.textEditor;
        const newPosition = editor.selection.active;

        // Clear any previous timeout if the cursor moves
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // If the position has changed, reset the lastPosition and start a new timer
        if (!lastPosition || !newPosition.isEqual(lastPosition)) {
            lastPosition = newPosition;

            // Start a timeout to trigger the bookmark only if the cursor doesn't move for 30 seconds
            timeoutId = setTimeout(() => {
                const lineKey = `${editor.document.fileName}:${newPosition.line}`;
                if (!bookmarkedLines.has(lineKey)) {
                    triggerBookmark(newPosition.line, editor);
                    bookmarkedLines.add(lineKey); // Mark the line as bookmarked
                } else {
                    vscode.window.showInformationMessage('This line is already bookmarked!');
                }
            }, getTimerDelay());
        }
    });

    function triggerBookmark(line: number, editor: vscode.TextEditor) {
        vscode.commands.executeCommand('bookmarks.toggle').then(() => {
            vscode.window.showInformationMessage(`Auto Bookmark added on line ${line + 1}!`);
        });
    }

    context.subscriptions.push(disposable);
}

export function deactivate() {}
