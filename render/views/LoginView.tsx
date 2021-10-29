import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Formik } from 'formik';
import Joi from '@hapi/joi';
import { useHistory } from 'react-router-dom';

import { Input, Label } from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Copyrights from '../components/Copyrights';
import DragArea from '../components/DragArea';
import { useOvermindActions, useOvermindState } from '../store';

const Container = styled.div`
  display: grid;
  grid-template-rows: repeat(4, 25vh);
  grid-template-columns: repeat(6, minmax(100px, 1fr));
  align-items: center;
  justify-items: center;
`;

const LoginForm = styled.form`
  padding: 40px;
  grid-column: 2 / 6;
  grid-row: 2 / 4;
  min-width: 300px;
  min-height: 500px;
`;

const Headline = styled.h1`
  text-align: center;
  font-size: 40px;
  color: ${props => props.theme.main};
`;

const CopyrightsContainer = styled.div`
  grid-row: 4;
  grid-column: 2 / 6;
  align-self: end;
  margin-bottom: 20px;
`;

const SubmitButton = styled(Button)`
  padding: 10px 5px;
  margin: 25px auto 0px auto;
`;

type ValidateArgs = {
  apiKey: string;
  username: string;
  password: string;
  redmineEndpoint: string;
}

const LoginView = () => {
  const [useApiKey, setUseApiKey] = useState(false);
  const [loginError, setLoginError] = useState<Error>();

  const actions = useOvermindActions();
  const state = useOvermindState();

  const history = useHistory();

  useEffect(() => {
    if (state.users.currentUser?.id) {
      history.push('/app/summary');
    }
  }, [state.users.currentUser]);

  const validate = ({
    apiKey, username, password, redmineEndpoint
  }: ValidateArgs) => {
    const errors = {
      redmineEndpoint: Joi.string()
        .uri()
        .required()
        .validate(redmineEndpoint)
    };
    if (useApiKey) {
      // @ts-expect-error needs proper typing
      errors.apiKey = Joi.string()
        .required()
        .validate(apiKey);
    } else {
      // @ts-expect-error needs proper typing
      errors.username = Joi.string()
        .required()
        .validate(username);
      // @ts-expect-error needs proper typing
      errors.password = Joi.string()
        .required()
        .validate(password);
    }
    const results = {};
    for (const [prop, validation] of Object.entries(errors)) {
      if (validation.error) {
        // @ts-expect-error needs proper typing
        results[prop] = validation.error.message.replace('value', prop);
      }
    }
    return results;
  };

  const onSubmit = (values: any, { setSubmitting }: { setSubmitting: (b: boolean) => void }) => {
    actions.users.login({ ...values }).then(({ success, error }) => {
      setSubmitting(false);
      if (error) {
        setLoginError(error);
      } else if (success) {
        history.push('/app/summary');
      }
    });
  };

  const onToggleLoginMode = () => {
    setUseApiKey(use => !use);
  };

  return (
    <Container>
      <DragArea />
      <Formik
        initialValues={{
          username: '',
          password: '',
          apiKey: '',
          redmineEndpoint: ''
        }}
        validate={validate}
        onSubmit={onSubmit}
      >
        {({
          values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting
        }) => (
          <LoginForm onSubmit={handleSubmit}>
            <Headline>Redshape</Headline>

            <Label label="Redmine Endpoint" htmlFor="redmineEndpoint">
              <Input
                name="redmineEndpoint"
                placeholder="https://redmine.example.com"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.redmineEndpoint}
              />
            </Label>
            <ErrorMessage show={Boolean(errors.redmineEndpoint && touched.redmineEndpoint)}>
              {errors.redmineEndpoint}
            </ErrorMessage>

            <Label label="Login mode" htmlFor="loginMode">
              <label>
                <Input
                  type="checkbox"
                  name="loginMode"
                  checked={useApiKey}
                  onChange={onToggleLoginMode}
                />
                <span>Use API Key</span>
              </label>
            </Label>
            {useApiKey ? (
              <>
                <Label label="API Key" htmlFor="apiKey">
                  <Input
                    type="text"
                    name="apiKey"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.apiKey}
                  />
                </Label>
                <ErrorMessage show={Boolean(errors.apiKey && touched.apiKey)}>{errors.apiKey}</ErrorMessage>
              </>
            ) : (
              <>
                <Label label="Login" htmlFor="username">
                  <Input
                    type="text"
                    name="username"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.username}
                  />
                </Label>
                <ErrorMessage show={Boolean(errors.username && touched.username)}>
                  {errors.username}
                </ErrorMessage>
                <Label label="Password" htmlFor="password">
                  <Input
                    type="password"
                    name="password"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.password}
                  />
                </Label>
                <ErrorMessage show={Boolean(errors.password && touched.password)}>
                  {errors.password}
                </ErrorMessage>
              </>
            )}

            <SubmitButton type="submit" disabled={isSubmitting} block={true}>
              Submit
            </SubmitButton>
            <ErrorMessage show={!!loginError}>{loginError && loginError.message}</ErrorMessage>
          </LoginForm>
        )}
      </Formik>
      <CopyrightsContainer>
        <Copyrights />
      </CopyrightsContainer>
    </Container>
  );
};

export default LoginView;
