import Digital from '../components/Digital';
import History from '../components/History';

export default [
    {
        path: '/',
        name: '实时监测',
        component: Digital
    },
    {
        path: '/history',
        name: '历史数据',
        component: History
    }
]