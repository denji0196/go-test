import { Darkmode } from "./Darkmode"
import DropdownListPofile from "./DropdownListPofile"
import Logo from "./Logo"

const Navbar = () => {
  return (
    <nav>
        <div className="container flex flex-col justify-between py-8 sm:flex-row sm:items-center gap-4">
            {/*logo*/}
            <Logo/>
            {/*search*/}
            
            {/*darkmode profile*/}
            <div className="flex gap-4">
              <Darkmode/>
              <DropdownListPofile/>
            </div>
        </div>
    </nav>
  )
}
export default Navbar