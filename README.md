# LaTeX Helper

A VSCode extension by [Aritra Bhowmick](https://github.com/ChesterXXX) to enhance the LaTeX editing experience. Principal motivation is from the amazing [Gilles Castel](https://castel.dev/). I don't claim any originality here, as most of these features are already implemented by other (better written) extensions. In particular, for more robust support (e.g, support for typst), look at the extension [Super Figure](https://marketplace.visualstudio.com/items?itemName=peterson.super-figure).

## Features

-   Highlights `\input{filename}` within LaTeX documents.
-   On click of `filename` in `\input{filenam}`, auto-creates new `filename.tex` file or opens existing ones.
-   Highlights the directory and filename inside `\import{dir}{filename}`.
-   Provides a snippet that generates LaTeX figure environment :
    -   The snippet is activated on `@` and is triggered on space or newline.
    -   Pressing `SPACEBAR`, `TAB` or `ENTER` after typing `@fig/test_fig` will generate the following code, which is customizable.
        ```
        \begin{figure}[h]
            \def\svgwidth{0.5\columnwidth}
            \import{./fig}{test_fig.pdf_tex}
            \label{fig:test_fig}
            \caption{Test Figure}
        \end{figure}
        ```
    -   There will be tabstops to edit `label` and `caption`.
-   On click of `filename` in `\import{dir}{test_fig.pdf_tex}` opens the SVG file `dir/test_fig.svg` in [InkScape](https://inkscape.org/). The file is created if necessary.
-   Changing the file `dir/test_fig.svg` automatically calls the `pdf-export` option in InkScape, and two new files ``dir/test_fig.pdf` and `dir/test_fig.pdf_tex` are created.
-   [TODO] Recomplie Latex document on `dir/test_fig.pdf_tex` change.

## Configuration

You can customize the following settings in your `settings.json`:

### Highlight Colors

-   **Color to highlight the text inside `\input{}`**:
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

### LaTeX Figure Environment Snippet

Customize the figure environment snippet with placeholders:

-   `#mul` for multiplier of width
-   `#dir` for directory
-   `#filename` for filename
    ```json
    "latex-helper.figureEnvironmentSnippet": "\\begin{figure}[h]\\n\\t\\def\\svgwidth{${1:#mul}\\columnwidth}\\n\\t\\import{#dir}{#filename.pdf_tex}\\n\\t\\label{fig:${2:#filename}}\\n\\t\\caption{${3:Some Figure}}\\n\\end{figure}"
    ```

### InkScape Settings

-   **Location of the InkScape executable**:

    ```json
    "latex-helper.inkscapeExecutableLocation": "C:\\src\\InkScape\\bin\\inkscape.exe"
    ```

-   **Command for compiling SVG to pdf_tex**:
    ```json
    "latex-helper.inkscapeExportCommand": "\"#executable\" -D --export-latex --export-dpi 300 --export-filename=\"#pdf\" \"#svg\""
    ```

### SVG Dimensions

-   **Default width of the SVG canvas**:

    ```json
    "latex-helper.svgWidth": 160
    ```

-   **Default height of the SVG canvas**:
    ```json
    "latex-helper.svgHeight": 80
    ```
