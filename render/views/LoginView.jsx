import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled, { withTheme } from 'styled-components';
import { Formik } from 'formik';
import Joi from 'joi';
import { withRouter } from 'react-router-dom';
import GithubCircleIcon from 'mdi-react/GithubCircleIcon';

import actions from '../actions';

import { Input, Label } from '../components/Input';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import Link from '../components/Link';
import Copyrights from '../components/Copyrights';
import DragArea from '../components/DragArea';

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

class LoginView extends Component {  
  componentDidMount() {
    const { userId, api_key } = this.props;
    if (userId && api_key) {
      this.props.history.push('/app/summary');
    }
  }

  validate = ({ username, password, redmineEndpoint }) => {
    const errors = {
      username: Joi.validate(username, Joi.string().required()),
      password: Joi.validate(password, Joi.string().required()),
      redmineEndpoint: Joi.validate(redmineEndpoint, Joi.string().uri().required())
    };
    const results = {};
    for (const [prop, validation] of Object.entries(errors)) {
      if (validation.error) {
        results[prop] = validation.error.message.replace('value', prop);
      }
    }
    return results;
  };

  onSubmit = (values, { setSubmitting }) => {
    const { checkLogin } = this.props;
    checkLogin(values).then(() => {
      const { loginError, userId } = this.props;
      if (!loginError && userId) {
        this.props.history.push('/app/summary');
      }
      setSubmitting(false);
    });
  }

  render() {
    const { loginError } = this.props; 
    return (
      <Container>
        <DragArea />
        <Formik
          initialValues={{ username: '', password: '', redmineEndpoint: '' }}
          validate={this.validate}
          onSubmit={this.onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <LoginForm onSubmit={handleSubmit}>
              <Headline>Redshape</Headline>
              <Label
                label="Login"
                htmlFor="username"
              >
                <Input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.username}
                />
              </Label>
              <ErrorMessage show={errors.username && touched.username}>
                {errors.username}
              </ErrorMessage>
              <Label
                label="Password"
                htmlFor="password"
              >
                <Input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                />
              </Label>
              <ErrorMessage show={errors.password && touched.password}>
                {errors.password}
              </ErrorMessage>
              <Label
                label="Redmine Endpoint"
                htmlFor="redmineEndpoint"
              >
                <Input
                  name="redmineEndpoint"
                  placeholder="https://redmine.example.com"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.redmineEndpoint}
                />
              </Label>
              <ErrorMessage show={errors.redmineEndpoint && touched.redmineEndpoint}>
                {errors.redmineEndpoint}
              </ErrorMessage>
              <SubmitButton
                type="submit"
                disabled={isSubmitting}
                block={true}
              >
                Submit
              </SubmitButton>
              <ErrorMessage show={!!loginError}>
                {loginError && loginError.message}
              </ErrorMessage>
            </LoginForm>
          )}
        </Formik>
        <CopyrightsContainer>
          <Copyrights />
        </CopyrightsContainer>
      </Container>
    );
  }
}

LoginView.propTypes = {
  userId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  api_key: PropTypes.string,
  loginError: PropTypes.instanceOf(Error),
  checkLogin: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  userId: state.user.id,
  api_key: state.user.api_key,
  loginError: state.user.loginError
});

const mapDispatchToProps = dispatch => ({
  checkLogin: credentials => dispatch(actions.user.checkLogin(credentials))
});

export default withTheme(connect(mapStateToProps, mapDispatchToProps)(withRouter(LoginView)));
