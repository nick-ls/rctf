import Form from '../components/form'
import config from '../../../config/client'
import withStyles from '../components/jss'
import { register } from '../api/auth'
import UserCircle from '../icons/user-circle.svg'
import { useEffect, useState, useCallback } from 'preact/hooks'

export default withStyles({
  root: {
    padding: '1.5em'
  },
  submit: {
    marginTop: '1.5em'
  },
  title: {
    textAlign: 'center'
  }
}, ({ classes, ctftimeToken }) => {
  const [disabledButton, setDisabledButton] = useState(false)
  const division = config.defaultDivision.toString()
  const [showName, setShowName] = useState(false)

  const [name, setName] = useState('')
  const handleNameChange = useCallback(e => setName(e.target.value), [])

  const [errors, setErrors] = useState({})

  const handleRegister = useCallback(() => {
    setDisabledButton(true)

    register({
      ctftimeToken,
      name: name || undefined,
      division
    })
      .then(({ errors, data }) => {
        setDisabledButton(false)

        if (!errors) {
          return
        }
        if (errors.name) {
          setShowName(true)
          setName(data)
        }

        setErrors(errors)
      })
  }, [ctftimeToken, name, division])

  const handleSubmit = useCallback(e => {
    e.preventDefault()

    handleRegister()
  }, [handleRegister])

  // Try login with CTFtime token only, if fails prompt for name
  useEffect(handleRegister, [])

  return (
    <div class='row u-center'>
      <Form class={`${classes.root} col-6`} onSubmit={handleSubmit} disabled={disabledButton} errors={errors} buttonText='Register'>
        { showName &&
          <input autofocus required icon={<UserCircle />} name='name' placeholder='Team Name' type='text' value={name} onChange={handleNameChange} />
        }
      </Form>
    </div>
  )
})
