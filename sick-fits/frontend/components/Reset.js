import React, {Component} from 'react';
import {Mutation} from "react-apollo";
import gql from "graphql-tag"
import Form from "./styles/Form";
import Error from "./ErrorMessage"
import PropTypes from "prop-types";
import {CURRENT_USER_QUERY} from "./User";

const RESET_MUTATION = gql`
    mutation RESET_MUTATION($resetToken: String!, $password: String!, $confirmPassword: String!) {
        resetPassword(resetToken: $resetToken, password: $password, confirmPassword :$confirmPassword) {
            id
            email
            name
        }
    }
`;

class Reset extends Component {

  static propTypes = {
    resetToken: PropTypes.isRequired
  };

  state = {
    password: "",
    confirmPassword: "",
  }

  saveToState = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  render() {
    return (
      <Mutation mutation={RESET_MUTATION} variables={{
        resetToken: this.props.resetToken,
        password: this.state.password,
        confirmPassword: this.state.confirmPassword
      }} refetchQueries={[{query: CURRENT_USER_QUERY}]}>
        {(resetFn, {error, loading, called}) => {

          return (
            <Form method="post" onSubmit={async (e) => {
              e.preventDefault();
              await resetFn();

              console.log("request function")
              console.log(called)
              //the next line will only be reached when the reset is a success. If a reset errors, then an Error will be thrown and this line never reached.
              this.setState({password: "", confirmPassword: ""})
            }}>
              <fieldset disabled={loading} aria-busy={loading}>
                <Error error={error}/>

                <label htmlFor={"password"}> Password <input type="password" name="password" placeholder="password"
                                                             value={this.state.password}
                                                             onChange={this.saveToState}/>
                </label>


                <label htmlFor={"confirmPassword"}> Password <input type="password" name="confirmPassword"
                                                                    placeholder="confirm your password"
                                                                    value={this.state.confirmPassword}
                                                                    onChange={this.saveToState}/>
                </label>

                <button type={"submit"}>Reset your password</button>
              </fieldset>
            </Form>)
        }}
      </Mutation>
    );
  }
}

export default Reset;