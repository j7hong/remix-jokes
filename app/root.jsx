import {
  LiveReload,
	Outlet,
	Links,
	useCatch,
	Meta,
	Scripts,
} from "remix";

import globalStylesUrl from '~/styles/global.css'
import globalMediumStylesUrl from '~/styles/global-medium.css'
import globalLargeStylesUrl from '~/styles/global-large.css'

export const links = () => {
	return [
		{ 
			rel: "stylesheet", 
			href: globalStylesUrl
		},
		{ 
			rel: "stylesheet", 
			href: globalMediumStylesUrl,
			media: "print, (min-width: 640px)",
		},
		{ 
			rel: "stylesheet", 
			href: globalStylesUrl,
			media: "screen and (min-width: 1040px)",
		},
	];
};

export const meta = () => {
	const description = `Learn Remix and laugh at the same time.`;
	return {
		description,
		keywords: "Remix,jokes",
		"twitter:image": "https://remix-jokes.lol/social.png",
		"twitter:card": "summary_large_image",
		"twitter:creator": "@remix_run",
		"twitter:site": "@remix_run",
		"twitter:title": "Remix Jokes",
		"twitter:description": description,
	};
};

export function Document({
	children,
	title = `Remix: Jokes App Tutorial`,
	}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
				<Meta />
				<title>{title}</title>	
				<Links />
      </head>
      <body>
				{children}
				<Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
	return (
		<Document>
			<Outlet />
		</Document>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	return (
		<Document 
			title={`${caught.status} ${caught.statusText}`}>
			<div className="error-container">
				<h1>
					{caught.status} {caught.statusText}
				</h1>
			</div>
		</Document>
	);
}

export function ErrorBoundary({ error }) {
	console.error(error);

	return (
		<Document title="Uh-oh!">
			<div className="error-container">
				<h1>App Error</h1>
				<pre>{error.message}</pre>
			</div>
		</Document>
	);
}
