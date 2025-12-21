import styles from './index.module.scss'
import appSetting from '@configs'
import logo from '@/assets/images/logo.png'

const Navbar = () => {
  const { name, desc } = appSetting

  return (
    <div className={`${styles['navbar']}`}>
      <div className={`${styles['navbar-logo-wrapper']}`}>
        <img className={`${styles['logo-image']}`} src={logo} alt={name} />
        {/* <div className={`${styles['logo-text']}`}>{desc}</div> */}
      </div>
      <div className={`${styles['navbar-controls-wrapper']}`}></div>
    </div>
  )
}

export default Navbar
