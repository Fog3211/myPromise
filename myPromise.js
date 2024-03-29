function myPromise(executor) {
	const _this = this

	_this.status = 'pending' //记录状态
	_this.value = undefined //成功的值
	_this.reason = undefined //失败原因
	_this.resCallbackArr = [] // 保存resolve函数
	_this.rejCallbackArr = [] //保存reject函数

	function resolve(value) {
		if (_this.status === 'pending') {
			_this.value = value
			_this.status = 'resolved'
			_this.resCallbackArr.forEach(fn => {
				fn(value)
			})
		}
	}

	function reject(reason) {
		if (_this.status === 'pending') {
			_this.reason = reason
			_this.status = 'rejected'
			_this.rejCallbackArr.forEach(fn => {
				fn(reason)
			})
		}
	}

	try {
		executor(resolve, reject);
	} catch (err) {
		reject(err);
	}
}

myPromise.prototype.then = function (fn1, fn2) {

	const _this = this
	let promise2 = null

	fn1 = typeof fn1 === 'function' ? fn1 : function () {}
	fn2 = typeof fn2 === 'function' ? fn2 : function () {}

	if (_this.status === 'resolved') {
		return promise2 = new myPromise(function (resolve, reject) {
			try {
				const result = fn1(_this.value)
				resolve(result)
			} catch (e) {
				reject(e)
			}
		})
	}
	if (_this.status === 'rejected') {
		return promise2 = new myPromise(function (resolve, reject) {
			try {
				const result = fn2(_this.reason)
				reject(result)
			} catch (e) {
				reject(e)
			}
		})
	}

	if (_this.status === 'pending') {
		return promise2 = new myPromise(function (resolve, reject) {

			_this.resCallbackArr.push(function () {
				try {
					const result = fn1(_this.value);
					resolve(result)
				} catch (e) {
					reject(e)
				}
			})
			_this.rejCallbackArr.push(function () {
				try {
					const result = fn2(_this.reason);
					reject(result)
				} catch (e) {
					reject(e)
				}
			})
		})
	}
}

myPromise.prototype.catch = function (fn) {
	const _this = this
	return _this.then(null, fn)
}

let p = new myPromise(function (resolve, reject) {
	console.log('start')

	let randomNumber = Math.random(0, 1) * 10
	if (randomNumber > 5) {
		setTimeout(() => {
			resolve('res-init1')
		})
	} else {
		setTimeout(() => {
			reject('rej-init1')
		})
	}
})

p.then(
		(v) => {
			console.log('success1： ' + v)
			return 'res-then1'
		},
		(v) => {
			console.log('error1： ' + v)
			return 'rej-then1'
		}
	)
	.then(
		(v) => {
			// 模拟resolve里面调用reject的情况
			let randomNumber = Math.random(0, 1) * 10
			if (randomNumber > 5) {
				throw new Error('这里抛出一个异常e')
			} else {
				console.log('success2： ' + v)
				return 'res-then2'
			}
		},
		(v) => {
			console.log('error2： ' + v)
			return 'rej-then2'
		}
	)
	.then(() => {
		console.log('end')
		return 'end'
	}).catch(() => {
		console.log('catch')
		return 'catch'
	})