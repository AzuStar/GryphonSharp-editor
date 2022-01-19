# Gryphonsharp-vscode README
<img src="https://user-images.githubusercontent.com/52426335/127782714-2f404c37-d82b-462d-a9b2-8efe582ed955.png" alt="logo" width="200"/>

## Schemas
Collection of schemas for components of node editor communications. This repo will contain all schemas even those used by transpiler and overwatch.
### Editor Commands
> Commands sent by vsc to the editor when update in the filesystem happens.<br>
> All commands prefixed 'editor-'
1. `editor-sync`
```
command: 'editor-sync'
data: {document body} | undefined
```
Instructs NodeEditor to refresh contents of the document. This is used when document was edited externally or loaded for the first time. <br>
If data is null or undefined, editor will assume new file, broken files are not properly accounted for.

#### Alternative implementation (less effecient)


1. `editor-load`
```
command: 'editor-load'
data: {document body} | undefined
```
Instructs NodeEditor to initialize from existing body.<br>
If data is null or undefined, editor will construct empty workbench.

2. `editor-sync`
```
command: 'editor-sync'
data: {document body} | undefined
```
Instructs NodeEditor to refresh contents of the document (keeping history of previous states). This is used when document was edited externally and change was caught by VSCode. <br>
If data is null or undefined, editor will assume deletion of the document, but will keep state and mark source as 'deleted/moved'.

### VSCode Commands
> Commands sent by the ditor to vsc host <br>
> All commands prefixed 'vsc-'
1. `vsc-ready`
```
command: 'vsc-ready'
```
Instruct VSCode that the NodeEditor is fully operational.<br>
Usually VSCode will issue `editor-load` of current document command upon receiving ready command.

2. `vsc-sync`
```
command: 'vsc-sync'
data: {document body}
```
Instructs VSCode to ping any other opened instances of the document about the changes. This will also notify VSCode of changes and change internal state of the document to be 'changed', which is marked by a circle next to a name of the document and can be saved (or is saved automatically by VSCode through built-in auto-save setting).
