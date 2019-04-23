import React from "react";
import Signup from "../components/Signup";
import Signin from "../components/Signin";
import RequestReset from "../components/RequestReset";

import StyledComponents from "styled-components";

const Columns = StyledComponents.div`
display: grid;
grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
grid-gap: 20px;
`;

const SignupPage = props => (
  <Columns>
    <p>Access your account</p>
    <Signup/>
    <Signin/>
    <RequestReset/>
  </Columns>
);

export default SignupPage;
