# 项目规则

## 数据库表结构

- 生成或修改数据库表结构时，所有时间相关字段必须使用 `integer` 类型的 `timestamp_ms`。
- 时间字段需要设置默认值时，必须使用：

  ```ts
  sql`(cast(unixepoch('subsecond') * 1000 as integer))`
  ```
