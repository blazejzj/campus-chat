import styles from "./index.css?url";

export function Document({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>CampusChat</title>
                <link rel="modulepreload" href="/src/client.tsx" />
                <link rel="stylesheet" href={styles} />
            </head>
            <body>
                <div id="root">{children}</div>
                <script type="module">{`import "/src/client.tsx";`}</script>
            </body>
        </html>
    );
}
