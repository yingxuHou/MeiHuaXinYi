import axios from './request'

// 认证相关API接口（真实后端对接）
export const authAPI = {
	// 用户登录
	async login(credentials) {
		// 后端使用 identifier 作为邮箱/用户名字段
		return axios.post('/auth/login', {
			identifier: credentials.email,
			password: credentials.password,
			rememberMe: !!credentials.rememberMe
		})
	},

	// 用户注册（后端需要 username、email、password，可选 phone/profile）
	async register(userData) {
		return axios.post('/auth/register', {
			username: userData.username,
			email: userData.email,
			password: userData.password,
			// 兼容后续扩展字段（可选）
			...(userData.phone ? { phone: userData.phone } : {}),
			...(userData.profile ? { profile: userData.profile } : {})
		})
	},

	// 刷新访问令牌
	async refreshToken(refreshToken) {
		return axios.post('/auth/refresh', { refreshToken })
	},

	// 获取当前用户信息
	async getUserInfo() {
		return axios.get('/user/profile')
	},

	// 更新用户资料（映射为后端 { profile, phone } 结构）
	async updateProfile(profileData) {
		const payload = {
			profile: {
				nickname: profileData.nickname,
				gender: profileData.gender,
				birthday: profileData.birthDate
			},
			phone: profileData.phone
		}
		return axios.put('/user/profile', payload)
	},

	// 登出（可选：让后端将token加入黑名单）
	async logout() {
		return axios.post('/auth/logout')
	},

	// 修改密码（已登录）
	async changePassword(data) {
		return axios.post('/user/change-password', {
			currentPassword: data.oldPassword,
			newPassword: data.newPassword,
			confirmPassword: data.confirmPassword
		})
	},

	// 获取占卜次数信息
	async getDivinationCount() {
		return axios.get('/user/divination-count')
	}
}
