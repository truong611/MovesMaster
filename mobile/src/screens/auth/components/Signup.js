import React from 'react';
import LoginForm from './LoginForm';

class Signup extends React.Component {

  render() {
    return (
      <LoginForm type="signup" submit={this.props.submit}/>
    );
  }
}

export default Signup;
