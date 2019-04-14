import React from "react";
import Signup from "../components/Signup";
import StyledComponents from "styled-components";

const Columns = StyledComponents.div`
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
grid-gap: 20px;
`;

const SignupPage = props => (
  <Columns>
    <p>This is the signup page </p>
    <Signup/>
    <Signup/>
    <Signup/>
  </Columns>
);

export default SignupPage;
