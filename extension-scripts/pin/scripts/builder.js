var dataManager = require("./data-manager");
var helper = require("./helper");
var textItems = dataManager.getTextItems();
var actionItems = dataManager.getActionItems();

function createClipboardView() {
  return {
    type: "list",
    props: {
      id: "clipboard-list",
      reorder: true,
      rowHeight: $app.env == $env.today ? 36 : 44,
      separatorColor: $app.env == $env.today ? $rgba(100, 100, 100, 0.25) : $color("separator"),
      data: textItems,
      actions: [
        {
          title: "delete",
          handler: function(sender, indexPath) {
            if (textItems[indexPath.row] === $clipboard.text) {
              $clipboard.text = "";
            }
            helper.arrayRemove(textItems, indexPath.row);
            saveTextItems();
            reloadTextItems();
          }
        },
        {
          title: $l10n("EDIT"),
          handler: function(sender, indexPath) {
            $input.text({
              text: textItems[indexPath.row]
            }).then(function(text) {
              if (text.length > 0) {
                textItems[indexPath.row] = text;
                sender.data = textItems;
                saveTextItems();
              }
            });
          }
        },
        {
          title: $l10n("SEARCH"),
          handler: function(sender, indexPath) {
            helper.searchText(textItems[indexPath.row]);
          }
        }
      ]
    },
    layout: listViewLayout(),
    events: {
      didSelect: function(sender, indexPath, object) {
        $clipboard.text = object;
        $ui.toast($l10n("COPIED"));
        $device.taptic(1);
      },
      reorderMoved: function(fromIndexPath, toIndexPath) {
        helper.arrayMove(textItems, fromIndexPath.row, toIndexPath.row);
      },
      reorderFinished: function() {
        saveTextItems();
      }
    }
  }
}

function saveTextItems() {
  dataManager.setTextItems(textItems);
}

function reloadTextItems() {
  textItems = dataManager.getTextItems();
}

function saveActionItems() {
  dataManager.setActionItems(actionItems);
}

function reloadActionItems() {
  actionItems = dataManager.getActionItems();
}

function createActionView() {
  return {
    type: "list",
    props: {
      id: "action-list",
      rowHeight: 64,
      reorder: true,
      actions: [
        {
          title: "delete",
          handler: function(sender, indexPath) {
            helper.arrayRemove(actionItems, indexPath.row);
            saveActionItems();
          }
        },
        {
          title: $l10n("LAUNCH"),
          handler: function(sender, indexPath) {
            var pattern = actionItems[indexPath.row].pattern;
            helper.openURL(pattern);
          }
        }
      ],
      template: {
        views: [
          {
            type: "label",
            props: {
              id: "action-name-label"
            },
            layout: function(make, view) {
              make.top.inset(10);
              make.left.inset(15);
            }
          },
          {
            type: "label",
            props: {
              id: "action-pattern-label"
            },
            layout: function(make, view) {
              make.bottom.inset(8);
              make.left.inset(15);
              make.right.inset(72);
            }
          },
          {
            type: "image",
            props: {
              id: "action-icon-image",
              bgcolor: $color("clear")
            },
            layout: function(make, view) {
              make.centerY.equalTo(view.super);
              make.right.inset(15);
              make.size.equalTo($size(24, 24));
            }
          }
        ]
      },
      data: actionItems.map(function(item) {
        return createActionItem(item);
      })
    },
    layout: listViewLayout(),
    events: {
      reorderMoved: function(fromIndexPath, toIndexPath) {
        helper.arrayMove(actionItems, fromIndexPath.row, toIndexPath.row);
      },
      reorderFinished: function() {
        saveActionItems();
      }
    }
  }
}

function createActionItem(item) {
  return {
    "action-name-label": {
      "text": item.name
    },
    "action-pattern-label": {
      "text": item.pattern
    },
    "action-icon-image": {
      "icon": $icon(item.icon)
    }
  };
}

function listViewLayout() {
  return function(make, view) {
    make.left.right.equalTo(0);
    make.top.inset(44);
    make.bottom.inset($app.env == $env.today ? 44 : 52);
  }
}

module.exports = {
  createClipboardView: createClipboardView,
  createActionView: createActionView,  
  reloadTextItems: reloadTextItems,
  createActionItem: createActionItem,
  reloadActionItems: reloadActionItems,
}