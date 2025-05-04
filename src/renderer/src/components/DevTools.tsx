import React, { useState, useEffect } from 'react';

interface ApiMethod {
    name: string;
    available: boolean;
    type: string;
}

const DevTools: React.FC = () => {
    const [apiMethods, setApiMethods] = useState<ApiMethod[]>([]);
    const [showDevTools, setShowDevTools] = useState(false);
    const [clipboardMessage, setClipboardMessage] = useState('');

    useEffect(() => {
        // Check availability of all API methods
        const checkApiMethods = () => {
            if (!window.api) {
                console.error('API object not found');
                return [];
            }

            const expectedMethods = [
                'getGames',
                'importGame',
                'deleteGame',
                'onGamesUpdated',
                'updateGameSettings',
                'setGameStyle',
                'trackPlaytime',
                'launchGame',
                'getAchievements',
                'getAchievementProgress',
                'unlockAchievement',
                'onAchievementUnlocked'
            ];

            return expectedMethods.map(method => {
                const available = typeof window.api[method as keyof typeof window.api] === 'function';
                const type = available ? typeof window.api[method as keyof typeof window.api] : 'undefined';

                return {
                    name: method,
                    available,
                    type
                };
            });
        };

        setApiMethods(checkApiMethods());
    }, []);

    const copyDiagnosticsToClipboard = () => {
        const diagnosticInfo = {
            timestamp: new Date().toISOString(),
            apiMethods: apiMethods,
            environment: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                windowSize: {
                    width: window.innerWidth,
                    height: window.innerHeight
                }
            }
        };

        try {
            navigator.clipboard.writeText(JSON.stringify(diagnosticInfo, null, 2));
            setClipboardMessage('Diagnostic information copied to clipboard!');
            setTimeout(() => setClipboardMessage(''), 3000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            setClipboardMessage('Failed to copy. See console for details.');
            setTimeout(() => setClipboardMessage(''), 3000);
        }
    };

    const styles = {
        container: {
            maxWidth: '800px',
            margin: '0 auto',
            padding: '20px',
        } as React.CSSProperties,
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
        } as React.CSSProperties,
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000',
            textTransform: 'uppercase' as const,
            background: '#FFE66D',
            padding: '8px 16px',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
            transform: 'rotate(-1deg)'
        } as React.CSSProperties,
        toggleButton: {
            backgroundColor: '#4ECDC4',
            border: '2px solid #000',
            padding: '5px 10px',
            marginLeft: '10px',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 'bold',
        } as React.CSSProperties,
        methodsTable: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            marginTop: '20px',
            backgroundColor: '#fff',
            border: '2px solid #000',
        } as React.CSSProperties,
        th: {
            backgroundColor: '#f3f3f3',
            padding: '10px',
            textAlign: 'left' as const,
            borderBottom: '2px solid #000',
        } as React.CSSProperties,
        td: {
            padding: '10px',
            borderBottom: '1px solid #ddd',
        } as React.CSSProperties,
        statusAvailable: {
            color: 'green',
            fontWeight: 'bold',
        } as React.CSSProperties,
        statusUnavailable: {
            color: 'red',
            fontWeight: 'bold',
        } as React.CSSProperties,
        copyButton: {
            backgroundColor: '#6A5ACD',
            color: 'white',
            border: '2px solid #000',
            padding: '8px 15px',
            margin: '20px 0',
            fontSize: '14px',
            cursor: 'pointer',
            fontWeight: 'bold',
        } as React.CSSProperties,
        clipboardMessage: {
            padding: '10px',
            marginTop: '10px',
            backgroundColor: '#4ECDC4',
            color: 'white',
            borderRadius: '4px',
            display: clipboardMessage ? 'block' : 'none',
            textAlign: 'center' as const,
        } as React.CSSProperties,
        infoBox: {
            backgroundColor: '#f8f8f8',
            padding: '15px',
            borderRadius: '5px',
            marginTop: '20px',
            fontSize: '14px',
            lineHeight: '1.5',
            border: '1px solid #ddd',
        } as React.CSSProperties,
        buildCommand: {
            backgroundColor: '#333',
            color: '#fff',
            padding: '10px',
            borderRadius: '3px',
            fontFamily: 'monospace',
            marginTop: '10px',
            fontSize: '12px',
        } as React.CSSProperties,
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Developer Tools</h1>
                <button
                    style={styles.toggleButton}
                    onClick={() => setShowDevTools(!showDevTools)}
                >
                    {showDevTools ? 'Hide Details' : 'Show Details'}
                </button>
            </div>

            <p>This page helps diagnose API connectivity issues. Technical information can be shared with developers to help troubleshoot problems.</p>

            {showDevTools && (
                <>
                    <h2>API Methods Status</h2>
                    <table style={styles.methodsTable}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Method Name</th>
                                <th style={styles.th}>Available</th>
                                <th style={styles.th}>Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apiMethods.map(method => (
                                <tr key={method.name}>
                                    <td style={styles.td}>{method.name}</td>
                                    <td style={{ ...styles.td, ...(method.available ? styles.statusAvailable : styles.statusUnavailable) }}>
                                        {method.available ? 'Yes' : 'No'}
                                    </td>
                                    <td style={styles.td}>{method.type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <button
                        style={styles.copyButton}
                        onClick={copyDiagnosticsToClipboard}
                    >
                        Copy Diagnostic Information
                    </button>

                    <div style={styles.clipboardMessage}>
                        {clipboardMessage}
                    </div>

                    {/* <div style={styles.infoBox}>
                        <h3>Rebuilding the Application</h3>
                        <p>If you're seeing API methods unavailable, you may need to rebuild the application:</p>
                        <ol>
                            <li>Close the application</li>
                            <li>Open a terminal/command prompt</li>
                            <li>Navigate to the project directory</li>
                            <li>Run the following commands:</li>
                        </ol>
                        <div style={styles.buildCommand}>
                            npm run clean<br />
                            npm install<br />
                            npm run build<br />
                            npm start
                        </div>
                    </div> */}
                </>
            )}
        </div>
    );
};

export default DevTools; 