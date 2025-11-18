import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
	// 状态
	const userInfo = ref({
		id: null,
		email: '',
		nickname: '',
		avatar: '',
		gender: '',
		birthDate: '',
		phone: '',
		createdAt: null
	})
	
	const token = ref(localStorage.getItem('token') || '')
	const refreshToken = ref(localStorage.getItem('refreshToken') || '')
	const freeCount = ref(parseInt(localStorage.getItem('freeCount') || '0'))
	const isFirstLogin = ref(false)
	
	// 计算属性
	const isLoggedIn = computed(() => !!token.value && !!userInfo.value.id)
	const hasCompletedProfile = computed(() => {
		return !!(userInfo.value.nickname && userInfo.value.gender && userInfo.value.birthDate)
	})
	
	// 持久化辅助
	const setToken = (newToken, newRefreshToken = null) => {
		token.value = newToken || ''
		if (newRefreshToken !== null) {
			refreshToken.value = newRefreshToken || ''
		}
		if (token.value) {
			localStorage.setItem('token', token.value)
			if (refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value)
		} else {
			localStorage.removeItem('token')
			localStorage.removeItem('refreshToken')
		}
	}
	
	const setUserInfo = (info) => {
		userInfo.value = { ...userInfo.value, ...info }
		localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
	}
	
	const setFreeCount = (count) => {
		const n = Number.isFinite(count) ? count : 0
		freeCount.value = n
		localStorage.setItem('freeCount', String(n))
	}
	
	// 使用免费次数（减少1次）
	const useFreeCount = () => {
		if (freeCount.value > 0) {
			freeCount.value -= 1
			localStorage.setItem('freeCount', String(freeCount.value))
			return true
		}
		return false
	}
	
	// 映射后端 user 对象到前端 userInfo 平铺结构
	const mapBackendUserToLocal = (backendUser) => {
		if (!backendUser) return {}
		const profile = backendUser.profile || {}
		return {
			id: backendUser.id,
			email: backendUser.email,
			nickname: profile.nickname || '',
			avatar: profile.avatar || '',
			gender: profile.gender || '',
			birthDate: profile.birthday || '',
			phone: backendUser.phone || '',
			createdAt: backendUser.createdAt || null
		}
	}
	
	// 登录
	const login = async (credentials) => {
		const resp = await authAPI.login(credentials)
		if (!resp?.success) throw new Error(resp?.message || '登录失败')
		// 后端返回结构：data.user + data.tokens
		const backendUser = resp.data?.user
		const tokens = resp.data?.tokens
		if (!tokens?.accessToken) throw new Error('登录响应缺少accessToken')
		setToken(tokens.accessToken, tokens.refreshToken)
		setUserInfo(mapBackendUserToLocal(backendUser))
		// 免费次数（两种兼容来源）
		const fc = backendUser?.divination?.freeCount ?? resp.data?.freeCount
		setFreeCount(fc ?? 0)
		// 首次登录标记（如果后端未提供，则基于资料完整度判断）
		isFirstLogin.value = resp.data?.isFirstLogin ?? !hasCompletedProfile.value
		// 同步最新的占卜次数
		await syncDivinationCount()
		return { success: true, data: resp.data }
	}
	
	// 注册（仅邮箱+密码；自动生成username 满足后端校验）
	const register = async (userData) => {
		const email = userData.email?.trim()
		const password = userData.password
		if (!email || !password) throw new Error('请填写完整的注册信息')
		// 从邮箱生成用户名：取@前部分，清理非法字符，长度限制，追加随机数降低冲突概率
		const localPart = email.split('@')[0] || 'user'
		const cleaned = localPart.replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '') || 'user'
		const base = cleaned.slice(0, 16)
		const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
		const username = `${base}_${suffix}`
		const resp = await authAPI.register({ username, email, password })
		if (!resp?.success) throw new Error(resp?.message || '注册失败')
		const backendUser = resp.data?.user
		const tokens = resp.data?.tokens
		if (!tokens?.accessToken) throw new Error('注册响应缺少accessToken')
		setToken(tokens.accessToken, tokens.refreshToken)
		setUserInfo(mapBackendUserToLocal(backendUser))
		const fc = backendUser?.divination?.freeCount ?? resp.data?.freeCount
		setFreeCount(fc ?? 0)
		isFirstLogin.value = true
		// 同步最新的占卜次数
		await syncDivinationCount()
		return { success: true, data: resp.data }
	}
	
	// 更新用户资料
	const updateProfile = async (profileData) => {
		const resp = await authAPI.updateProfile(profileData)
		if (!resp?.success) throw new Error(resp?.message || '更新资料失败')
		const backendUser = resp.data?.user
		if (backendUser) {
			setUserInfo(mapBackendUserToLocal(backendUser))
		}
		isFirstLogin.value = false
		return { success: true, data: resp.data }
	}
	
	// 刷新Token
	const refreshAccessToken = async () => {
		if (!refreshToken.value) throw new Error('没有刷新令牌')
		const resp = await authAPI.refreshToken(refreshToken.value)
		if (!resp?.success) throw new Error(resp?.message || 'Token刷新失败')
		const tokens = resp.data?.tokens
		if (!tokens?.accessToken) throw new Error('刷新响应缺少accessToken')
		setToken(tokens.accessToken, tokens.refreshToken)
		return { success: true }
	}
	
	// 获取用户信息（用于应用初始化）
	const fetchUserInfo = async () => {
		if (!token.value) throw new Error('未登录')
		const resp = await authAPI.getUserInfo()
		if (!resp?.success) throw new Error(resp?.message || '获取用户信息失败')
		const backendUser = resp.data?.user
		setUserInfo(mapBackendUserToLocal(backendUser))
		const fc = backendUser?.divination?.freeCount ?? resp.data?.freeCount
		setFreeCount(fc ?? freeCount.value)
		return { success: true, data: resp.data }
	}

	// 同步占卜次数（从后端获取最新数据）
	const syncDivinationCount = async () => {
		if (!token.value) return
		try {
			const resp = await authAPI.getDivinationCount()
			if (resp?.success && resp.data?.freeCount !== undefined) {
				setFreeCount(resp.data.freeCount)
			}
		} catch (error) {
			console.error('同步占卜次数失败:', error)
		}
	}
	
	// 登出
	const logout = async () => {
		try {
			await authAPI.logout().catch(() => {})
		} finally {
			setToken('')
			setUserInfo({
				id: null,
				email: '',
				nickname: '',
				avatar: '',
				gender: '',
				birthDate: '',
				phone: '',
				createdAt: null
			})
			setFreeCount(0)
			isFirstLogin.value = false
			localStorage.removeItem('userInfo')
			localStorage.removeItem('freeCount')
		}
	}
	
	// 初始化（从本地恢复，并尝试获取后端资料）
	const initializeUser = async () => {
		try {
			const savedUserInfo = localStorage.getItem('userInfo')
			const savedFreeCount = localStorage.getItem('freeCount')
			if (savedUserInfo) setUserInfo(JSON.parse(savedUserInfo))
			if (savedFreeCount) setFreeCount(parseInt(savedFreeCount))
			// 如果已有token，尝试拉取后端资料刷新本地
			if (token.value) {
				await fetchUserInfo().catch(() => {})
				// 同步最新的占卜次数
				await syncDivinationCount()
			}
		} catch (e) {
			console.error('初始化用户数据错误:', e)
		}
	}
	
	return {
		// 状态
		userInfo,
		token,
		refreshToken,
		freeCount,
		isFirstLogin,
		// 计算
		isLoggedIn,
		hasCompletedProfile,
		// 方法
		login,
		register,
		updateProfile,
		refreshAccessToken,
		fetchUserInfo,
		logout,
		initializeUser,
		syncDivinationCount,
		setToken,
		setUserInfo,
		setFreeCount,
		useFreeCount
	}
})
