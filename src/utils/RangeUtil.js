const RangeUtil = {
	highlight(tag, range, className, attributes = []) {
		range = range.getRangeAt ? range.getRangeAt(0) : range
		let time = null

		if (tag === 'li') {
			let ul = document.createElement('ul')
			let li = document.createElement('li')
			range.surroundContents(li)
			range.surroundContents(ul)
		} else {
			for (let r of this.walkRange(range)) {
				let mark = document.createElement(tag)
				attributes.forEach((attr) => {
					mark.setAttribute(attr.name, attr.value)
				})
				if (
					this.walkRange(range).length < 2 &&
					range.startOffset === range.endOffset
				) {
					time = Date.now()
					mark.setAttribute('id', time)
				}

				mark.className = className
				r.surroundContents(mark)
			}
		}

		return time
	},

	getAllParentNode(node) {
		let parentNodes = []

		if (node.parentNode) {
			parentNodes.push(node.parentNode)
			parentNodes = [
				...parentNodes,
				...this.getAllParentNode(node.parentNode)
			]
		}

		return parentNodes
	},

	getFirstTextNode(el) {
		if (!el) {
			return null
		}
		if (el.nodeType === Node.TEXT_NODE) {
			return el
		}

		for (let child of el.childNodes) {
			if (child.nodeType === Node.TEXT_NODE) {
				return child
			} else {
				let textNode = this.getFirstTextNode(child)
				if (textNode !== null) {
					return textNode
				}
			}
		}

		return null
	},

	walkRange(range) {
		let ranges = []
		let el = range.startContainer
		console.log('range.startContainer', range.startContainer)

		let elsToVisit = true
		while (elsToVisit) {
			let startOffset =
				el === range.startContainer ? range.startOffset : 0
			let endOffset =
				el === range.endContainer
					? range.endOffset
					: el.textContent.length
			let r = document.createRange()
			r.setStart(el, startOffset)
			r.setEnd(el, endOffset)
			ranges.push(r)

			elsToVisit = false
			while (!elsToVisit && el !== range.endContainer) {
				let nextEl = this.getFirstTextNode(el.nextSibling)
				if (nextEl) {
					el = nextEl
					elsToVisit = true
				} else {
					if (el.nextSibling) {
						el = el.nextSibling
					} else if (el.parentNode) {
						el = el.parentNode
					} else {
						break
					}
				}
			}
		}

		return ranges
	}
}

export default RangeUtil
