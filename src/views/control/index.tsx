import { Button, Toast } from '@douyinfe/semi-ui'

const Control = () => {
  return (
    <div>
      <Button onClick={() => Toast.warning({ content: 'welcome' })}>Hello Semi</Button>
    </div>
  )
}

export default Control
