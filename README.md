# LaTeX Helper

A VSCode extension by [Aritra Bhowmick](https://github.com/ChesterXXX) to enhance the LaTeX editing experience. The principal inspiration comes from the work of [Gilles Castel](https://castel.dev/). I don't claim any originality here, as most of these features are already implemented by other, more robust extensions. In particular, regarding InkScape support, have a look at [Super Figure](https://marketplace.visualstudio.com/items?itemName=peterson.super-figure), which supports Typst and GIMP as well.

-   [Features](#features)
    -   [Highlighting `\input{}` and `\import{}{}` statements meaningfully](#highlighting)
    -   [Auto-create `.tex` files from `\input{}`](#creating-tex-files-and-opening-them-in-tabs)
    -   [Create a single merged `.tex` file by replacing `\input{}`](#creating-a-single-merged-tex-file)
    -   [Figure snippet](#figure-snippet)
    -   [InkScape support, with auto-creating `.svg` and `.pdf_tex` files](#inkscape-support)
    -   [BibTeX support, with auto-generating citation keys and populating from `ArXiV` and `MathSciNet`](#bibtex-support)
-   [Available commands](#commands)
-   [Available configurations](#configurations)
    -   [Highlight Colors](#highlight-colors)
    -   [Figure Snippet](#latex-figure-environment-snippet)
    -   [InkScape Settings](#inkscape-settings)
    -   [SVG Settings](#svg-template-settings)
    -   [BibTex Settings](#bibtex-file-settings)

##  Features

#### Highlighting
-   Highlights `\input{filename}` within LaTeX documents.
-   Highlights the directory and filename inside `\import{dir}{filename}`.
-   For `\import{dir}{figname.pdf_tex}`, the three parts `dir`, `figname`, and `.pdf_tex` are highlighted separately.
-   All highlight colors can be customized.

#### Creating `.tex` Files and Opening Them in Tabs
-   Clicking `filename` in `\input{filename}` will auto-create a new `filename.tex` file if it doesn't already exist, then opens it in a new tab or switches to an existing tab if it's already open.

#### Creating A Single Merged `.tex` File
-   Creates a single `.tex` file by recursively replacing the content of `\input{filename}`.
-   Optionally, replaces any `\bibliography{ref}` by the content of the `.bbl` file. This assumes that the project is compiled correctly, with `BibTeX` enabled.

#### Figure Snippet
-   Provides a snippet, which is disabled by default, to generate a LaTeX figure environment:
    -   The snippet is activated by typing `@` (customizable), and is triggered on space or a new line.
    -   Pressing `SPACEBAR`, `TAB`, or `ENTER` after typing `@fig/test_fig` will generate the following code:
        ```
        \begin{figure}[h]
            \def\svgwidth{0.5\columnwidth}
            \import{./fig}{test_fig.pdf_tex}
            \label{fig:test_fig}
            \caption{Test Figure}
        \end{figure}
        ```
    -   Tabstops are provided to edit the values in `\svgwidth`, `\label`, and `\caption`.
    -   The figure code, including tabstops, can be customized.
    -   The snippet behavior can probably be obtained using the extension [HyperSnips](https://marketplace.visualstudio.com/items?itemName=draivin.hsnips). You can add the following to your latex.hsnips file
        ```
        snippet `@([\w\/]+)\/([\w]+);` "Figure" iA
        \begin{figure}[h]
            \def\svgwidth{${1:0.5}\columnwidth}
            \import{./``rv=m[1]``}{``rv=m[2]``.pdf_tex}
            \label{fig:${2:``rv=m[2]``}}
            \caption{${3:Some Figure}}
        \end{figure}$0
        endsnippet
        ```

#### InkScape Support
-   Clicking `figname` in `\import{dir}{figname.pdf_tex}` opens the SVG file `dir/figname.svg` via [InkScape](https://inkscape.org/). The `.svg` file is created if necessary, with a customizable template.
-   When the file `dir/figname.svg` is modified, InkScape automatically exports to `dir/figname.pdf` and `dir/figname.pdf_tex`.
-   If [LaTeX Workshop](https://marketplace.visualstudio.com/items?itemName=James-Yu.latex-workshop) is installed and active, then the LaTeX document is automatically compiled on any `dir/figname.pdf_tex` change, including first-time creation.
-   This behavior is achieved by using the VSCode native FileWatcher API, which only tracks file changes in the present workspace.
-   Optionally, the npm file watcher package [chokidar](https://www.npmjs.com/package/chokidar) can be used as well. This can support tracking `.svg` files stored outside the workspace as well.

#### BibTex Support
-   Handles `bibtex` entries via the npm library [@retorquere/bibtex-parser](https://www.npmjs.com/package/@retorquere/bibtex-parser).
-   Supports sorting `bibtex` files by citation keys.
-   Supporst automatically generating citation keys, while handling duplication.
-   Supports adding new `bibtex` entries from [ArXiV](https://arxiv.org/) and from [MathSciNet](https://mathscinet.ams.org/mathscinet/publications-search). Uses the [axios](https://www.npmjs.com/package/axios) package.
-   Supports searching for `bibtex` etries from a list of existing `.bib` files and adding them. Uses the package [fuse.js](https://www.npmjs.com/package/fuse.js) for fuzzy search.

##  Commands

### `latex` Commands
The following commands are available provided the editor language is `latex`.

#### `LaTeX Helper: Merge tex files into a single new file`
- **Command**: `latex-helper.mergeTexFiles`
- **Description**: Creates a new merged files by recursively replacing all `\input{}`, and optionally, replacing `\bibliography{}` by the content of the `.bbl` file.

#### `LaTeX Helper: Replace content of .bbl file`
- **Command**: `latex-helper.replaceBBL`
- **Description**: Creates a new merged files by replacing `\bibliography{}` by the content of the `.bbl` file

### `bibtex` Commands
The following commands are available provided the editor language is `bibtex`.

#### `LaTeX Helper: Sort bib file by citation keys`
- **Command**: `latex-helper.sortBibFileByCitationKey`
- **Description**: Sorts a bib file by citation keys.

#### `LaTeX Helper: Check bib file for duplicate citation keys`
- **Command**: `latex-helper.checkBibFileForDuplicateKeys`
- **Description**: Checks a bib file for duplicate citation keys.

#### `LaTeX Helper: Add new entries to bib file MathSciNet or ArXiV IDs`
- **Command**: `latex-helper.addToBibFileByIDs`
- **Description**: Adds new entries to a bib file using MathSciNet or ArXiV IDs.

#### `LaTeX Helper: Convert all citation keys`
- **Command**: `latex-helper.convertCitationKeys`
- **Description**: Converts all citation keys in a bib file.

### `LaTeX Helper: Fuzzy search a list of bib files by citation key, author or title`
- **Command**: `latex-helper.searchMasterBibFiles`
- **Description**: Performs a fuzzy search across a list of bib files by citation key, author, or title.

##  Configurations

You can customize the following settings in your `settings.json`:

#### Highlight Colors

-   **Color to highlight text inside `\input{}`**:
    ```json
    "latex-helper.inputTextHighlightColor": "DodgerBlue"
    ```
-   **Color to highlight the directory inside `\import{dir}{filename}`**:
    ```json
    "latex-helper.importDirectoryTextHighlightColor": "DarkGreen"
    ```

-   **Color to highlight the filename inside `\import{dir}{filename}`**:
    ```json
    "latex-helper.importFilenameTextHighlightColor": "DarkRed"
    ```

-   **Color to highlight the extension inside `\import{dir}{filename.pdf_tex}`**:
    ```json
    "latex-helper.importPdfTexTextHighlightColor": "Crimson"
    ```

#### LaTeX Figure Environment Snippet

-   **Enable or disable the figure snippet**:
    ```json
    "latex-helper.figureSnippetActivated": false
    ```

-   **Customize the figure environment snippet with placeholders**:
    -   `#mul` for width multiplier
    -   `#dir` for directory
    -   `#filename` for filename
    ```json
    "latex-helper.figureEnvironmentSnippet": "\\begin{figure}[h]\\n\\t\\def\\svgwidth{${1:#mul}\\columnwidth}\\n\\t\\import{#dir}{#filename.pdf_tex}\\n\\t\\label{fig:${2:#filename}}\\n\\t\\caption{${3:Some Figure}}\\n\\end{figure}"
    ```

#### InkScape Settings

-   **Location of the InkScape executable**:
    ```json
    "latex-helper.inkscapeExecutableLocation": "C:\\src\\InkScape\\bin\\inkscape.exe"
    ```

-   **Command for compiling SVG to pdf_tex**:
    ```json
    "latex-helper.inkscapeExportCommand": "\"#executable\" -D --export-latex --export-dpi 300 --export-filename=\"#pdf\" \"#svg\""
    ```

-   **Use VSCode FileWatcher API instead of `chokidar`:
    ```json
    "latex-helper.useChokidar": false
    ```

#### SVG Template Settings

-   **Default width of the SVG canvas**:
    ```json
    "latex-helper.svgWidth": 160
    ```

-   **Default height of the SVG canvas**:
    ```json
    "latex-helper.svgHeight": 80
    ```

#### BibTex File Settings

-   **A list of `.bib` files to do fuzzy search**:
    ```json
    "latex-helper.masterBibFiles": [],
    ```

-   **Automatically sort the entries in the bib file upon adding new ones**:
    ```json
    "latex-helper.autosortBibFile": true
    ```

-   **Choose the format for generating citation keys**:
    ```json
    "latex-helper.citationKeyFormat": "Default"
    ```
    Supports three possible values : `Default`, `AuthorsYear`, and `Authors_Title`.

    -   `Default` : Uses the existing citation key. While adding from ArXiV or MathSciNet, uses the corresponding code.
    -   `AuthorsYear` : Concatenates the author lastnames, cutoff by `latex-helper.authorCuttoff` value, and the year.
    -   `Authors_Title` : Concatenates all the author lastnames. Then concatenates all the words in the title, after removing some common words, shortening some other words, and cutting off total number of words.
    
    As an example, consider the `bibtex` entry obtained from MathSciNet.
    ```
    @book {MR440554,
            AUTHOR = {Milnor, John W. and Stasheff, James D.},
             TITLE = {Characteristic classes},
            SERIES = {Annals of Mathematics Studies, No. 76},
         PUBLISHER = {Princeton University Press, Princeton, NJ; University of Tokyo Press, Tokyo},
              YEAR = {1974},
             PAGES = {vii+331},
           MRCLASS = {57-01 (55-02 55F40 57D20)},
          MRNUMBER = {440554},
        MRREVIEWER = {F. Hirzebruch},
    }
    ```
    -   The generated key with `Default` will be unchanged, i.e., `MR440554`.
    -   The generated key with `AuthorsYear` will be `MilSta1974`, assuming `authorCuttoff` value is `3`.
    -   The generated key with `Authros_Title` will be `MilnorStasheff_CharClasses`, assuming `wordsCutoff` value is `5`, with `commonWords` and `replacements` set to the default values.


-   **Dictionary of word replacements**: _Only for `Authors_Title` format_
    ```json
    "latex-helper.replacements": {
        "top": "top",
        "compact": "cpt",
        "charac": "char",
        "...": "...",
        "group": "grp",
        "space": "sp"
    }
    ```

-   **List of common words to be ignored during citation key generation**: _Only for `Authors_Title` format_
    ```json
    "latex-helper.commonWords": [ "a", "an", "...", "some", "like"]
    ```

-   **Ignore title words after this cutoff**: _Only for `Authors_Title` format_
    ```json
    "latex-helper.wordsCutoff": 5
    ```

-   **Cutoff author names**: _Only for `AuthorsYear` format_
    ```json
    "latex-helper.authorCutoff": 3
    ```


