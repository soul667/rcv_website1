
  # rcv_website

  This is a code bundle for rcv_website. The original project is available at https://www.figma.com/design/rQRWqzNs7fvIzfHVW5gIMw/%E5%AE%9E%E9%AA%8C%E5%AE%A4%E4%B8%BB%E9%A1%B5%E7%BD%91%E7%AB%99.

  ## Running the code

  ```shell
  sudo apt update
  sudo apt install nodejs npm
  ```
  Run `pnpm i` to install the dependencies.

  Run `pnpm run dev` to start the development server.

  ## Background Color Variables

  Background colors are controlled in `src/index.css`.

  Edit these variables under `:root`:

  - `--page-bg-gray-900`: used by `.bg-gray-900`
  - `--page-bg-slate-900`: used by `.bg-slate-900`

  Mapping is defined near the bottom of `src/index.css`:

  - `.bg-gray-900 { background-color: var(--page-bg-gray-900) !important; }`
  - `.bg-slate-900 { background-color: var(--page-bg-slate-900) !important; }`
  

  ## Need Update
  -  实验室的仪器设备需要更新
  -  每个人的文章需要更新 （收集文章名即可，导出bibtex）