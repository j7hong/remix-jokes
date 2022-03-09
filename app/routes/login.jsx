import { useActionData, json, Link, useSearchParams, Form } from 'remix'

import { db } from '~/utils/db.server'
import { login, createUserSession, register } from '~/utils/session.server'

import stylesUrl from '../styles/login.css'

export const links = () => {
	return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta = () => ({
	title: "Remix Jokes | Login",
	description:
		"Login to submit your own jokes to Remix Jokes!"
});

function validateUsername(username) {
	if (username.length < 3) {
		return `That username is too short`;
	}
}

function validateUserPassword(password) {
	if (password.length < 6) {
		return `That password is too short`;
	}
}

const badRequest = (data) => 
	json(data, { status: 400 });

export const action = async ({request}) => {
	const form = await request.formData();
	const loginType = form.get("loginType");
	const username = form.get("username");
	const password = form.get("password");
	const redirectTo = form.get("redirectTo") || "/jokes";
	if (
		typeof username !== "string" ||
		typeof password !== "string" ||
		typeof loginType !== "string" ||
		typeof redirectTo !== "string"
	) {
		return badRequest({
			formError: `Form not submitted correctly.`,
		});
	}

	const fields = { loginType, username, password };
	const fieldErrors = {
		username: validateUsername(username),
		password: validateUserPassword(password),
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	switch (loginType) {
		case "login": {
			const user = await login({ username, password });
			if (!user) {
				return badRequest({
					fields,
					formError: `Username/Password combination is incorrect`,
				});
			}
      // if there is a user, create their session and redirect to /jokes
			return createUserSession(user.id, redirectTo);
		}
		case "register": {
			const userExists = await db.user.findUnique({
				where: { username },
			});
			if (userExists) {
				return badRequest({
					fields,
					formError: `User with username ${username} already exists`,
				});
			}
			const user = await register({ username, password });
			if (!user) {
				return badRequest({
					fields,
					formError: `Something went wrong trying to create a new user.`,
				});
			}
			return createUserSession(user.id, redirectTo);
		}
		default: {
			return badRequest({
				fields,
				formError: `Login type invalid`,
			});
		}
	}
};

export default function Login() {
  const [searchParams] = useSearchParams();
	const actionData = useActionData();
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={
              searchParams.get("redirectTo") ?? undefined
            }
          />
          <fieldset>
            <legend className="sr-only">
              Login or Register?
            </legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
							defaultValue={actionData?.fields?.username}
							aria-invalid={
								Boolean(actionData?.fieldErrors?.username) || 
								undefined
							}
							aria-errormessage={
								actionData?.fieldErrors?.username
									? "username-error"
									: undefined
							}
            />
						{actionData?.fieldErrors?.username ? (
							<p
								className="form-validation-error"
								role="alert"
								id="username-error"
							>
							{actionData.fieldErrors.username}
							</p>
						) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              type="password"
							defaultValue={actionData?.fields?.password}
							aria-invalid={
								Boolean(actionData?.fieldErrors?.password) || 
								undefined
							}
							aria-errormessage={
								actionData?.fieldErrors?.password
									? "password-error"
									: undefined
							}
						/>
						{actionData?.fieldErrors?.password ? (
							<p
								className="form-validation-error"
								role="alert"
								id="password-error"
							>
							{actionData.fieldErrors.password}
							</p>
						) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </Form>
      </div>
      <div className="links">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/jokes">Jokes</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
