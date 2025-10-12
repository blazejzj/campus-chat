export default function Landing() {
    return (
        <main className="mx-auto max-w-2xl p-8 text-center flex flex-col items-center gap-6">
            <h1 className="text-4xl font-extrabold theme-text-color">
                CampusChat
            </h1>
            <p>Nice and easy chat made by students, for students!</p>

            <div className="flex gap-3">
                <a
                    href="/login"
                    className="px-4 py-2 rounded-xl theme-bg-color text-white"
                >
                    Log in
                </a>
                <a href="/register" className="px-4 py-2 rounded-xl border">
                    Register
                </a>
            </div>
        </main>
    );
}
