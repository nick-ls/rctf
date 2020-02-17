import { Component } from 'preact'
import Form from '../components/form'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { register } from '../api/auth'

export default withStyles({
  root: {
    padding: '25px'
  },
  submit: {
    marginTop: '25px'
  }
}, class Register extends Component {
  state = {
    name: '',
    email: '',
    division: '',
    disabledButton: false,
    errors: {}
  }

  componentDidMount () {
    document.title = 'Registration' + config.ctfTitle
  }

  render ({ classes }, { name, email, division, disabledButton, errors }) {
    return (
      <div class='row u-center' errors={errors}>
        <Form class={classes.root + ' col-6'} onSubmit={this.handleSubmit} disabled={disabledButton} buttonText='Register'>
          <input autofocus icon='user-circle' name='name' placeholder='Team Name' type='text' value={name} onChange={this.linkState('name')} />
          <input icon='envelope-open' name='email' placeholder='Email' type='text' value={email} onChange={this.linkState('email')} />
          <select class='select' name='division' value={division} onChange={this.linkState('division')}>
            <option value='' disabled selected>Division</option>
            <option value='0'>High School</option>
            <option value='1'>College</option>
            <option value='2'>Other</option>
          </select>
        </Form>
      </div>
    )
  }

  handleSubmit = e => {
    e.preventDefault()

    this.setState({
      disabledButton: true
    })

    register(this.state)
      .then(errors => {
        this.setState({
          errors,
          disabledButton: false
        })
      })
  }
})
