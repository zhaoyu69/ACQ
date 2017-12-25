import Config from '../Components/SerialConfig';
import History from '../Components/History';
import Digital from '../Components/Digital';

export default [
    {
        path: '/',
        name: '参数配置',
        component: Config
    },
    {
        path: '/History',
        name: '历史数据',
        component: History
    },
    {
        path: '/Digital',
        name: '实时监测',
        component: Digital
    }
]