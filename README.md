# LaTeX Helper

A VSCode extension by [Aritra Bhowmick](https://github.com/ChesterXXX) to enhance the LaTeX editing experience. The principal inspiration comes from the work of [Gilles Castel](https://castel.dev/). I don't claim any originality here, as most of these features are already implemented by other, more robust extensions.

## Features

#### Highlighting
-   Highlights `\input{filename}` within LaTeX documents.
-   Highlights the directory and filename inside `\import{dir}{filename}`.
-   For `\import{dir}{figname.pdf_tex}`, the three parts `dir`, `figname`, and `.pdf_tex` are highlighted separately.
-   All highlight colors can be customized.

#### Creating `.tex` Files and Opening Them in Tabs
-   Clicking `filename` in `\input{filename}` will auto-create a new `filename.tex` file if it doesn't already exist, then opens it in a new tab or switches to an existing tab if it's already open.

#### Figure Snippet
-   Provides a snippet that generates a LaTeX figure environment:
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
    -   The snippet behavior can probably be obtained using the extension [HyperSnips](vscode:extension/draivin.hsnips). You can add the following to your latex.hsnips file
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
-   If [LaTeX Workshop](vscode:extension/James-Yu.latex-workshop) is installed and active, then the LaTeX document is automatically compiled on any `dir/figname.pdf_tex` change, including first-time creation.
-   This behavior is achieved by using the npm file watcher package [chokidar](https://www.npmjs.com/package/chokidar) and is inspired by the extension [Super Figure](vscode:extension/peterson.super-figure), which has more robust support (e.g., support for Typst and GIMP).

## Configuration

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

Customize the figure environment snippet with placeholders:

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

#### SVG Template Settings:

-   **Default width of the SVG canvas**:
    ```json
    "latex-helper.svgWidth": 160
    ```

-   **Default height of the SVG canvas**:
    ```json
    "latex-helper.svgHeight": 80
    ```
