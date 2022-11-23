import RangeUtil from '@/utils/RangeUtil'
import intersect from '@/utils/intersect'

export default class Editor {
    selectedTag = null
    selection = null
    buttons = []
    optionTags = ['b', 'i', 'a', 'li']
    newNodeId = null
    editor = null

    constructor() {
        this.editor = document.querySelector('.editor')
        if (!this.editor) {
            alert('Error, contact developer!')
            return
        }
        this.getControlButtons()
        this.addEventsHandler()
    }

    getControlButtons() {
        this.buttons = document.querySelectorAll('.btn')
    }

    addEventsHandler() {
        this.buttons.forEach((button) => {
            button.addEventListener('click', (e) => {
                this.buttonHandler(e)
            })
        })

        this.editor.addEventListener('mouseup', () => {
            this.setSelection()
            this.highlightSelectedButton()
        })
    }

    setSelection() {
        if (!this.selection) {
            this.selection = window.getSelection()
        }
    }

    buttonHandler(event) {
        event.preventDefault()
        event.stopPropagation()

        this.setSelection()

        if (this.selection?.anchorNode) {
            this.selectedTag =
                this.selectedTag === event.currentTarget.dataset.tag
                    ? null
                    : event.currentTarget.dataset.tag
            let oldNodeId = this.newNodeId
            this.newNodeId = this.markSelection()

            if (this.newNodeId) {
                const el = document.getElementById(this.newNodeId)
                this.setFocusPosition(el)
            } else if (oldNodeId) {
                const el = document.getElementById(oldNodeId)
                this.setFocusPosition(el.nextSibling, el)
            }
        }
        this.selectedTag = null

        this.setActiveButton(event.currentTarget)
    }

    setFocusPosition(el, oldElement) {
        const ELEMENT_NODE = 1

        let range = document.createRange()
        this.selection.removeAllRanges()

        if (el.nodeType === ELEMENT_NODE) {
            el.innerHTML = '&#xfeff' + el.innerHTML
            range.selectNodeContents(el)
            range.collapse(false)
            range.setStart(el, 1)
            range.setEnd(el, 1)
            this.selection.addRange(range)
        } else {
            let span = document.createElement('span')
            span.innerHTML += '&#xfeff'
            oldElement.after(span)
            range.selectNodeContents(span)
            range.collapse(false)
            range.setStart(el, 0)
            range.setEnd(el, 0)
            this.selection.addRange(range)
        }
        this.editor.focus()
    }

    markSelection() {
        if (this.selectedTag) {
            let attr = []
            if (this.selectedTag === 'a') {
                let link = prompt('Please enter the URL', 'http://')
                if (!link) {
                    return
                }
                attr.push({name: 'href', value: link})
            }
            return RangeUtil.highlight(
                this.selectedTag,
                this.selection,
                '',
                attr
            )
        }

        return false
    }

    highlightSelectedButton() {
        let allFocusNodeParentNode = RangeUtil.getAllParentNode(
            this.selection.focusNode
        )
        let allAnchorNodeParentNode = RangeUtil.getAllParentNode(
            this.selection.anchorNode
        )
        let allGeneralParentNode = intersect(
            allFocusNodeParentNode,
            allAnchorNodeParentNode
        )

        const selectedMarkTags = allGeneralParentNode
            .filter((node) => {
                return this.optionTags.includes(node.localName)
            })
            .map((n) => n.localName)

        this.buttons.forEach((button) => {
            if (selectedMarkTags.includes(button.dataset.tag)) {
                button.classList.add('active')
            } else {
                button.classList.remove('active')
            }
        })
    }

    setActiveButton(eventButton) {
        eventButton.classList.toggle('active')
        this.buttons.forEach((button) => {
            if (button !== eventButton) {
                button.classList.remove('active')
            } else {
                if (!button.classList.contains('active')) {
                    this.selectedTag = null
                }
            }
        })
    }
}
