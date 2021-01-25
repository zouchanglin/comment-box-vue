import Vue from 'vue'
import {
  Button,
  Avatar,
  Col,
  Row,
  Input,
  Rate,
  Form,
  FormItem,
  Select,
  Option,
  Popover,
  Divider,
  Timeline,
  TimelineItem,
  Dialog,
  Link,
  Tooltip,
  Message,
  MessageBox
} from 'element-ui'

Vue.use(Button)
Vue.use(Avatar)
Vue.use(Col)
Vue.use(Row)
Vue.use(Input)
Vue.use(Rate)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Select)
Vue.use(Option)
Vue.use(Popover)
Vue.use(Divider)
Vue.use(Timeline)
Vue.use(TimelineItem)
Vue.use(Dialog)
Vue.use(Link)
Vue.use(Tooltip)

Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
