import { exists, readTextFile, writeFile, BaseDirectory, mkdir } from '@tauri-apps/plugin-fs';
import { invoke } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Config = {
    author_name: string;
    author_email: string;
  };


export default function SettingConfig() {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const handleConfirm = async () => {
        const appConfig = await path.dataDir();
        const config = { author_name: name, author_email: email };
        const encoder = new TextEncoder();
        await writeFile(appConfig + '/Neptune/config.json', encoder.encode(JSON.stringify(config, null, 2)) );
        console.log(appConfig);
        console.log(config);
        navigate("/home");
    };

    useEffect(() => {
        (async () => {
            const fileExists = await exists('config.json', { baseDir: BaseDirectory.AppConfig });
            if (!fileExists) {
                const appConfig = await path.dataDir();
                console.log("appdata is now ",appConfig);
                try {
                    await mkdir('Neptune', { baseDir: BaseDirectory.AppConfig });
                } catch (error) {
                    console.log('Failed to create Neptune directory:', error);
                }
                const appDataPath = await path.join(appConfig, 'Neptune/');
                console.log("appdatapath is ",appDataPath.toString());
                const config = await invoke<Config>('load_or_create_config', { configDir: appDataPath });
                setName(config.author_name);
                setEmail(config.author_email);
            } else {
                const content = await readTextFile('config.json', { baseDir: BaseDirectory.AppConfig });
                const config = JSON.parse(content);
                console.log("config is ",config);
                setName(config.author_name);
                setEmail(config.author_email);
            }
        })();
    }, []);

    return (
        <div className="h-screen w-screen bg-black overflow-hidden fixed inset-0 flex items-center justify-center">
            
            <div className="absolute inset-0"></div>

            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>
            
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px]"></div>

            <div className="relative z-10 w-full max-w-md mx-auto px-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-4">Confirm your git details</h1>
                    <p className="text-gray-300">
                        This is the name and email that will be used to commit your changes.
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">Author Name</label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">Author Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleConfirm}
                    className="group relative w-full overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-800 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative flex items-center justify-center space-x-3 bg-gradient-to-r from-green-400/90 to-green-900/90 backdrop-blur-xl border border-white/20 text-white px-8 py-5 rounded-2xl font-semibold transition-all duration-300 group-hover:shadow-2xl group:hover group-hover:shadow-blue-500/25">
                        <span className="text-lg">Confirm</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                    translate-x-[-100%] group-hover:translate-x-[100%] 
                                    transition-transform duration-1000 ease-out rounded-2xl" />
                </button>
            </div>
        </div>
    )
}