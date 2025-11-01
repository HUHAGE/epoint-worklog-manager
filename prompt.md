在这个文件夹下面帮我开发一个谷歌浏览器插件， 插件页面展示2个tab：待填写、已填写，在待填写页面可以添加日志，填写的内容包括：项目、日志内容、工时、日期，添加的内容可以修改，用列表展示已添加的数据。
- 列表后面显示一个填充按钮，点击可以将这条日志自动填充到我们公司的日志页面(这个后面再实现)
- 填充完成的数据展示到“已填写”tab中去
- 界面UI清新大方，符合现代审美，扁平风格，有质感


待填写页面展示紧凑一些，点击添加按钮再显示要填写的字段，工时和日期展示到一行，待填写列表下面增加tab，每个项目对应一个tab；增加一个预设项目按钮来预设可以挑选的项目，新增日志时直接挑选项目


接下来，实现提交按钮的功能，点击提交后，将待填写的日志填充到公司的日志页面，对应日志页面地址：https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/missionapplyadd。对应的页面代码路径：日志页面\missionapplyadd.html。填充的位置是填充到页面的datagrid中，填充的内容包括：任务名称、工作内容、申请工时，任务时间默认是当前日期。如果datagrid中的行数不够，自动增加新的行。


点击“提交”按钮，判断当前浏览器是否处于https://oa.epoint.com.cn/epointprojectm/projectmanage/mission/missionapply/missionapplyadd页面，否则提示：请先打开非功能任务申请页面，然后点击提交按钮。missionapplyadd页面打开时会默认加载三条任务数据到datagrid中，点击提交按钮后，请你将对应的任务数据填充到datagrid中，如果datagrid中的行数不够，自动增加新的行。